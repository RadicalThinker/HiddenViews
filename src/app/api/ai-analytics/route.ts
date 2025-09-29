import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import EventModel from '@/model/Event';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET(request: NextRequest) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  const userId = _user._id;

  try {
    const user = await UserModel.findById(userId).populate('events');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Collect all reviews from user's events
    const allReviews: any[] = [];
    if (user.events && Array.isArray(user.events)) {
      for (const event of user.events as any[]) {
        if (event.reviews && Array.isArray(event.reviews)) {
          allReviews.push(...event.reviews);
        }
      }
    }

    // If no reviews, return basic stats
    if (allReviews.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: {
          overallSentiment: 'neutral',
          sentimentScore: 0,
          keyThemes: [],
          improvementSuggestions: ['Start collecting reviews to get insights'],
          summary: 'No reviews available for analysis yet.',
          monthlyTrend: 'stable',
          strongPoints: [],
          weakPoints: [],
        }
      });
    }

    // Prepare review data for AI analysis
    const reviewTexts = allReviews.map((review: any) => ({
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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response
    let analytics;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analytics = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback analytics
      analytics = {
        overallSentiment: user.profileStats.averageRating >= 4 ? 'positive' : 
                         user.profileStats.averageRating >= 3 ? 'neutral' : 'negative',
        sentimentScore: (user.profileStats.averageRating - 3) / 2,
        keyThemes: ['General feedback'],
        improvementSuggestions: ['Continue engaging with your audience'],
        summary: `Based on ${allReviews.length} reviews with an average rating of ${user.profileStats.averageRating.toFixed(1)} stars.`,
        monthlyTrend: 'stable',
        strongPoints: ['Consistent engagement'],
        weakPoints: ['More data needed for detailed analysis'],
      };
    }

    // Add some computed metrics
    const ratingDistribution = {
      5: allReviews.filter((r: any) => r.rating === 5).length,
      4: allReviews.filter((r: any) => r.rating === 4).length,
      3: allReviews.filter((r: any) => r.rating === 3).length,
      2: allReviews.filter((r: any) => r.rating === 2).length,
      1: allReviews.filter((r: any) => r.rating === 1).length,
    };

    return NextResponse.json({
      success: true,
      analytics: {
        ...analytics,
        ratingDistribution,
        totalReviews: allReviews.length,
        averageRating: user.profileStats.averageRating,
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
