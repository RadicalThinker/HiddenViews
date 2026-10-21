import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import EventModel from '@/model/Event';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await dbConnect();

  const authUser = await resolveAuthUser(request);
  if (!authUser) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  const userId = authUser._id;

  try {
    const user = await UserModel.findById(userId).populate('events');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawEventId = searchParams.get('eventId')?.trim();
    const rawSlug = searchParams.get('slug')?.trim();

    // Treat 'all' or empty strings as aggregate requests
    const eventId = rawEventId && rawEventId !== 'all' ? rawEventId : null;
    const slug = rawSlug && rawSlug !== 'all' ? rawSlug : null;

    let allReviews: any[] = [];
    let avgRating = 0;

    if (eventId || slug) {
      const eventFilter: any = { createdBy: userId };
      if (eventId) {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
          return NextResponse.json(
            { success: false, message: 'Invalid eventId format' },
            { status: 400 }
          );
        }
        eventFilter._id = eventId;
      }
      if (slug) eventFilter.slug = slug;

      const targetEvent = await EventModel.findOne(eventFilter);
      if (!targetEvent) {
        return NextResponse.json(
          { success: false, message: 'Event not found' },
          { status: 404 }
        );
      }

      if (targetEvent.reviews && Array.isArray(targetEvent.reviews)) {
        allReviews = targetEvent.reviews;
      }
      avgRating = targetEvent.stats?.averageRating ?? 0;
      if (allReviews.length > 0 && !avgRating) {
        const sum = allReviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0);
        avgRating = Math.round((sum / allReviews.length) * 10) / 10;
      }
    } else {
      // Aggregate across all organizer events directly from Event collection
      const userEvents = await EventModel.find({ createdBy: userId });
      if (userEvents && userEvents.length > 0) {
        for (const event of userEvents) {
          if (event.reviews && Array.isArray(event.reviews)) {
            allReviews.push(...event.reviews);
          }
        }
      } else if (user.events && Array.isArray(user.events)) {
        for (const event of user.events as any[]) {
          if (event.reviews && Array.isArray(event.reviews)) {
            allReviews.push(...event.reviews);
          }
        }
      }

      avgRating = user.profileStats?.averageRating || 0;
      if (allReviews.length > 0 && !avgRating) {
        const sum = allReviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0);
        avgRating = Math.round((sum / allReviews.length) * 10) / 10;
      }
    }

    // Computed rating distribution (defensively coerce strings and rounded integers)
    const ratingDistribution: Record<string, number> = {
      '1': allReviews.filter((r: any) => Math.round(Number(r.rating)) === 1).length,
      '2': allReviews.filter((r: any) => Math.round(Number(r.rating)) === 2).length,
      '3': allReviews.filter((r: any) => Math.round(Number(r.rating)) === 3).length,
      '4': allReviews.filter((r: any) => Math.round(Number(r.rating)) === 4).length,
      '5': allReviews.filter((r: any) => Math.round(Number(r.rating)) === 5).length,
    };

    // If no reviews, return complete zero-state stats
    if (allReviews.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: {
          overallSentiment: 'neutral',
          sentimentScore: 0,
          keyThemes: [],
          improvementSuggestions: ['Start collecting reviews to get AI insights'],
          summary: 'No reviews available for analysis yet.',
          monthlyTrend: 'stable',
          strongPoints: [],
          weakPoints: [],
          ratingDistribution,
          totalReviews: 0,
          averageRating: avgRating,
          lastUpdated: new Date().toISOString(),
        }
      });
    }

    // Prepare review data for AI analysis (capped to recent 100 to stay within prompt budget)
    const reviewTexts = allReviews.slice(-100).map((review: any) => ({
      content: review.content,
      rating: review.rating,
      date: review.createdAt
    }));

    // Create prompt for Gemini
    const prompt = `
    Analyze the following reviews and provide insights in JSON format:

    Reviews: ${JSON.stringify(reviewTexts)}

    Please provide analysis in this exact JSON structure:
    {
      "overallSentiment": "positive|neutral|negative",
      "sentimentScore": number between -1 and 1,
      "keyThemes": ["theme1", "theme2", "theme3"],
      "improvementSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
      "summary": "2-3 sentence summary of overall feedback",
      "monthlyTrend": "improving|stable|declining",
      "strongPoints": ["strength1", "strength2"],
      "weakPoints": ["weakness1", "weakness2"]
    }

    Base your analysis on:
    1. Overall sentiment from review content and ratings
    2. Common themes and keywords mentioned
    3. Constructive suggestions for improvement
    4. Trends in ratings over time
    5. What users appreciate most
    6. Areas that need attention

    Keep responses concise and actionable. Focus on genuine insights from the data.
    `;

    let analytics: any = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analytics = JSON.parse(jsonMatch[0]);
        }
      } catch (geminiError) {
        console.error('Error generating AI analytics with Gemini:', geminiError);
      }
    }

    // Heuristic fallback analytics when AI key is missing or parsing failed
    if (!analytics) {
      analytics = {
        overallSentiment: avgRating >= 4 ? 'positive' : avgRating >= 3 ? 'neutral' : 'negative',
        sentimentScore: Number(((avgRating - 3) / 2).toFixed(2)),
        keyThemes: ['Attendee Experience', 'Event Organization', 'Audience Engagement'],
        improvementSuggestions: ['Continue engaging with your audience and gathering feedback'],
        summary: `Based on ${allReviews.length} reviews with an average rating of ${avgRating.toFixed(1)} stars.`,
        monthlyTrend: 'stable',
        strongPoints: ['Consistent attendee participation', 'Engaged community'],
        weakPoints: allReviews.length < 5 ? ['More review volume needed for deeper pattern analysis'] : ['Continue iterating on attendee feedback'],
      };
    }

    return NextResponse.json({
      success: true,
      analytics: {
        overallSentiment: analytics.overallSentiment || (avgRating >= 4 ? 'positive' : avgRating >= 3 ? 'neutral' : 'negative'),
        sentimentScore: typeof analytics.sentimentScore === 'number' ? analytics.sentimentScore : 0,
        keyThemes: Array.isArray(analytics.keyThemes) ? analytics.keyThemes : [],
        improvementSuggestions: Array.isArray(analytics.improvementSuggestions) ? analytics.improvementSuggestions : [],
        summary: analytics.summary || `Based on ${allReviews.length} reviews with an average rating of ${avgRating.toFixed(1)} stars.`,
        monthlyTrend: analytics.monthlyTrend || 'stable',
        strongPoints: Array.isArray(analytics.strongPoints) ? analytics.strongPoints : [],
        weakPoints: Array.isArray(analytics.weakPoints) ? analytics.weakPoints : [],
        ratingDistribution,
        totalReviews: allReviews.length,
        averageRating: avgRating,
        lastUpdated: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Error generating AI analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}
