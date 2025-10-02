"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/pagination";
import {
  Star,
  MessageSquare,
  Calendar,
  Trophy,
  RefreshCcw,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Tag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface EventData {
  _id: string;
  title: string;
  description?: string;
  eventType: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  stats: {
    averageRating: number;
    totalReviews: number;
    totalQueries: number;
    resolvedQueries: number;
  };
}

interface Review {
  _id: string;
  content: string;
  rating: number;
  createdAt: Date;
}

type ParsedReport = {
  sentiment?: string;
  strengths: string[];
  improvements: string[];
  themes: string[];
  tip?: string;
};

function parseReport(text: string): ParsedReport {
  const sections: ParsedReport = {
    sentiment: undefined,
    strengths: [],
    improvements: [],
    themes: [],
    tip: undefined,
  };
  if (!text) return sections;

  const normalize = (l: string) =>
    l
      .replace(/^[\s>*#`_~-]+/, "")
      .replace(/\*\*/g, "")
      .trim();
  const lines = text
    .split(/\r?\n/)
    .map(normalize)
    .filter((l) => l.length > 0);
  let current: keyof ParsedReport | "" = "";

  const isHeading = (l: string) =>
    /(overall\s*sentiment|top\s*strengths|areas?\s*for\s*improvement|common\s*themes|closing\s*tip|actionable\s*closing\s*tip)/i.test(
      l
    );
  const whichHeading = (l: string): keyof ParsedReport | "" => {
    const s = l.toLowerCase();
    if (s.includes("overall") && s.includes("sentiment")) return "sentiment";
    if (s.includes("top") && s.includes("strength")) return "strengths";
    if (s.includes("area") && s.includes("improve")) return "improvements";
    if (s.includes("common") && s.includes("theme")) return "themes";
    if (s.includes("tip")) return "tip";
    return "";
  };
  const isBullet = (l: string) => /^[-*•]\s+/.test(l) || /^\d+\.\s+/.test(l);
  const cleanBullet = (l: string) =>
    l
      .replace(/^[-*•]\s+/, "")
      .replace(/^\d+\.\s+/, "")
      .trim();

  for (const line of lines) {
    if (isHeading(line)) {
      current = whichHeading(line);
      // Capture same-line content after ':' or '-' if present
      const idxColon = line.indexOf(":");
      const idxDash = line.indexOf("-");
      let suffix = "";
      if (idxColon !== -1) suffix = line.slice(idxColon + 1).trim();
      else if (idxDash !== -1) suffix = line.slice(idxDash + 1).trim();
      if (suffix) {
        if (
          current === "strengths" ||
          current === "improvements" ||
          current === "themes"
        ) {
          (sections[current] as string[]).push(suffix);
        } else if (current === "sentiment") {
          sections.sentiment =
            (sections.sentiment ? sections.sentiment + " " : "") + suffix;
        } else if (current === "tip") {
          sections.tip = (sections.tip ? sections.tip + " " : "") + suffix;
        }
      }
      continue;
    }
    if (!current) continue;
    if (
      current === "strengths" ||
      current === "improvements" ||
      current === "themes"
    ) {
      if (isBullet(line)) {
        (sections[current] as string[]).push(cleanBullet(line));
      } else if (line) {
        // Some models may not prefix with bullets — treat as a single bullet
        (sections[current] as string[]).push(line);
      }
    } else if (current === "sentiment") {
      sections.sentiment =
        (sections.sentiment ? sections.sentiment + " " : "") + line;
    } else if (current === "tip") {
      sections.tip = (sections.tip ? sections.tip + " " : "") + line;
    }
  }
  return sections;
}

function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);

  const [report, setReport] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [successfulEventsPage, setSuccessfulEventsPage] = useState(1);
  const [allEventsPage, setAllEventsPage] = useState(1);

  const eventsPerPage = 6; // 2 rows of 3 cards for successful events
  const allEventsPerPage = 5;

  const userName =
    (session?.user as any)?.username ||
    (session?.user as any)?.name ||
    (session?.user as any)?.email ||
    "User";

  const userInitial = useMemo(
    () => String(userName).charAt(0).toUpperCase(),
    [userName]
  );

  const parsed = useMemo(() => parseReport(report), [report]);

  const aggregateStats = useMemo(() => {
    const totalEvents = events.length;
    const totals = events.reduce(
      (acc, e) => {
        acc.totalReviews += e.stats.totalReviews;
        acc.totalQueries += e.stats.totalQueries;
        acc.sumAvg += e.stats.averageRating;
        return acc;
      },
      { totalReviews: 0, totalQueries: 0, sumAvg: 0 }
    );
    const averageRating = totalEvents ? totals.sumAvg / totalEvents : 0;
    return {
      totalEvents,
      totalReviews: totals.totalReviews,
      totalQueries: totals.totalQueries,
      averageRating,
    };
  }, [events]);

  const successfulEvents = useMemo(() => {
    // Consider events with avg rating >= 3.5 as successful
    return events.filter((e) => e.stats.averageRating >= 3.5);
  }, [events]);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/events");
      if (res.data?.success) {
        setEvents(res.data.events);
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchAllReviews = useCallback(async () => {
    if (!events.length) return;
    setIsReviewsLoading(true);
    try {
      const requests = events.map((e) =>
        axios.get(`/api/events/${e.slug}/reviews-queries`)
      );
      const responses = await Promise.allSettled(requests);
      const reviews: Review[] = [];
      for (const r of responses) {
        if (r.status === "fulfilled") {
          const data = r.value.data;
          if (data?.success && Array.isArray(data.reviews)) {
            for (const rev of data.reviews) {
              if (rev?.content) reviews.push(rev);
            }
          }
        }
      }
      setAllReviews(reviews);
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setIsReviewsLoading(false);
    }
  }, [events, toast]);

  const generateReport = useCallback(async () => {
    if (!allReviews.length) {
      toast({
        title: "No reviews",
        description: "No reviews found to summarize yet.",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const reviewTexts = allReviews.map((r) => r.content);
      const res = await axios.post("/api/profile-summary", {
        reviews: reviewTexts,
        userName,
        totalReviews: aggregateStats.totalReviews,
        averageRating: aggregateStats.averageRating,
      });
      setReport(String(res.data ?? ""));
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [allReviews, aggregateStats, userName, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (events.length) {
      fetchAllReviews();
    }
  }, [events, fetchAllReviews]);

  useEffect(() => {
    if (allReviews.length && !report) {
      generateReport();
    }
  }, [allReviews, report, generateReport]);

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please sign in to view your profile
          </h1>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="border border-secondary-200 dark:border-bg-300 bg-white dark:bg-gradient-to-r dark:from-bg-200 dark:to-bg-300 p-6 rounded-2xl mb-6">
        <div className="relative overflow-hidden flex items-start gap-6">
          {/* Avatar */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 dark:bg-customPrimary-200 text-primary-700 dark:text-primary-300 text-3xl font-semibold select-none shadow-sm">
            {userInitial}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100 text-balance">
              {userName}
            </h1>
            <p className="text-secondary-600 dark:text-secondary-300 mt-1">
              Welcome back! Here&apos;s your profile overview.
            </p>

            {/* Quick Stats */}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 mb-2">
          <Card className="dark:bg-customPrimary-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Total Events
                </p>
                <p className="text-2xl font-bold">
                  {aggregateStats.totalEvents}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </CardContent>
          </Card>
          <Card className=" dark:bg-customPrimary-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Total Reviews
                </p>
                <p className="text-2xl font-bold">
                  {aggregateStats.totalReviews}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </CardContent>
          </Card>
          <Card className=" dark:bg-customPrimary-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Total Queries
                </p>
                <p className="text-2xl font-bold">
                  {aggregateStats.totalQueries}
                </p>
              </div>
              <MessageSquare className="w-8 h-8 text-accent-600" />
            </CardContent>
          </Card>
          <Card className="  dark:bg-customPrimary-200 ">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Average Rating
                </p>
                <p className="text-2xl font-bold">
                  {aggregateStats.averageRating.toFixed(1)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gemini Report */}
      <Card className="mb-8 dark:bg-customPrimary-100 w-full overflow-hidden">
        <CardHeader className="md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" /> AI Review Overview
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllReviews}
              disabled={isReviewsLoading || isLoading}
              className="dark:hover:text-zinc-950"
            >
              <RefreshCcw className="w-4 h-4 mr-2 dark:hover:text-zinc-950" /> Refresh Reviews
            </Button>
            <Button
              onClick={generateReport}
              disabled={isGenerating || isReviewsLoading || !allReviews.length}
              
            >
              {isGenerating ? "Generating..." : "Regenerate Report"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isGenerating || (isReviewsLoading && !report) ? (
            <p className="text-secondary-600 dark:text-secondary-400">
              Generating report...
            </p>
          ) : report ? (
            <div className="space-y-6">
              {parsed.sentiment && (
                <Card className="dark:bg-bg-100">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                      Overall Sentiment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm italic text-secondary-700 dark:text-secondary-200">
                      {parsed.sentiment}
                    </p>
                  </CardContent>
                </Card>
              )}
              {parsed.strengths.length > 0 && (
                <Card className="dark:bg-bg-100">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-semibold text-secondary-800 dark:text-secondary-200">
                      Top Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {parsed.strengths.map((s, i) => (
                        <li
                          key={`s-${i}`}
                          className="flex items-start gap-2 rounded-md border border-secondary-200 dark:border-bg-300 p-3 bg-white/60 dark:bg-bg-100"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                          <span className="text-sm text-secondary-700 dark:text-secondary-200">
                            {s}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {parsed.improvements.length > 0 && (
                <Card className="dark:bg-bg-100">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-semibold text-secondary-800 dark:text-secondary-200">
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {parsed.improvements.map((s, i) => (
                        <li
                          key={`i-${i}`}
                          className="flex items-start gap-2 rounded-md border border-secondary-200 dark:border-bg-300 p-3 bg-white/60 dark:bg-bg-100"
                        >
                          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                          <span className="text-sm text-secondary-700 dark:text-secondary-200">
                            {s}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {parsed.themes.length > 0 && (
                <Card className="dark:bg-bg-100">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-semibold text-secondary-800 dark:text-secondary-200">
                      Common Themes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {parsed.themes.map((s, i) => (
                        <li
                          key={`t-${i}`}
                          className="flex items-start gap-2 rounded-md border border-secondary-200 dark:border-bg-300 p-3 bg-white/60 dark:bg-bg-100"
                        >
                          <Tag className="w-4 h-4 text-blue-600 mt-0.5" />
                          <span className="text-sm text-secondary-700 dark:text-secondary-200">
                            {s}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {parsed.tip && (
                <Card className="dark:bg-bg-100">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-semibold text-secondary-800 dark:text-secondary-200">
                      Closing Tip
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-secondary-700 dark:text-secondary-200">
                      {parsed.tip}
                    </p>
                  </CardContent>
                </Card>
              )}
              {/* No markdown fallback: show gentle message if parsing yields nothing */}
              {!parsed.sentiment &&
                parsed.strengths.length === 0 &&
                parsed.improvements.length === 0 &&
                parsed.themes.length === 0 &&
                !parsed.tip && (
                  <p className="text-secondary-600 dark:text-secondary-400">
                    No structured insights available from the current report.
                    Try regenerating.
                  </p>
                )}
              <div className="pt-1">
                <Badge variant="secondary">
                  Reviews analyzed: {allReviews.length}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-secondary-600 dark:text-secondary-400">
              No report yet. Click &quot;Regenerate Report&quot; to generate a
              summary of your reviews.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Successful Events */}
      <Card className="mb-8 dark:bg-bg-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-600" /> Successful Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-secondary-600 dark:text-secondary-400">
              Loading events...
            </p>
          ) : successfulEvents.length ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {successfulEvents
                  .slice(
                    (successfulEventsPage - 1) * eventsPerPage,
                    successfulEventsPage * eventsPerPage
                  )
                  .map((e) => (
                    <Card key={e._id} className="dark:bg-customPrimary-200/20">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{e.title}</h3>
                          <Badge variant="secondary">{e.eventType}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary-600 dark:text-secondary-400">
                            Avg Rating
                          </span>
                          <span className="font-medium flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-600" />{" "}
                            {e.stats.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-secondary-600 dark:text-secondary-400">
                            Reviews
                          </span>
                          <span className="font-medium">
                            {e.stats.totalReviews}
                          </span>
                        </div>
                        <div className="pt-2">
                          <Link href={`/dashboard/events/${e.slug}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full dark:bg-bg-100 dark:hover:bg-bg-300"
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Pagination for Successful Events */}
              {Math.ceil(successfulEvents.length / eventsPerPage) > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={successfulEventsPage}
                    totalPages={Math.ceil(
                      successfulEvents.length / eventsPerPage
                    )}
                    onPageChange={setSuccessfulEventsPage}
                    showPreviousNext={true}
                    maxVisiblePages={3}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-secondary-600 dark:text-secondary-400">
              No successful events yet. Keep collecting great feedback!
            </p>
          )}
        </CardContent>
      </Card>

      {/* All Events Quick List */}
      <Card className="mb-8 dark:bg-bg-200">
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-secondary-600 dark:text-secondary-400">
              Loading...
            </p>
          ) : events.length ? (
            <>
              <div className="space-y-3">
                {events
                  .slice(
                    (allEventsPage - 1) * allEventsPerPage,
                    allEventsPage * allEventsPerPage
                  )
                  .map((e) => (
                    <div
                      key={e._id}
                      className="flex dark:bg-zinc-700 items-center justify-between p-3 rounded-lg border border-secondary-200 dark:border-bg-300"
                    >
                      <div>
                        <p className="font-medium">{e.title}</p>
                        <p className="text-xs text-secondary-600 dark:text-secondary-400">
                          {e.eventType} •{" "}
                          {new Date(e.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-600" />{" "}
                          {e.stats.averageRating.toFixed(1)}
                        </span>
                        <span className="text-secondary-600 dark:text-secondary-400">
                          {e.stats.totalReviews} reviews
                        </span>
                        <Link href={`/dashboard/events/${e.slug}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="dark:bg-bg-100 dark:hover:bg-bg-300"
                          >
                            Open
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination for All Events */}
              {Math.ceil(events.length / allEventsPerPage) > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={allEventsPage}
                    totalPages={Math.ceil(events.length / allEventsPerPage)}
                    onPageChange={setAllEventsPage}
                    showPreviousNext={true}
                    maxVisiblePages={5}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-secondary-600 dark:text-secondary-400">
              No events found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePageWrapper() {
  const { data: session } = useSession();

  return <ProfilePage key={session?.user?._id || "no-user"} />;
}
