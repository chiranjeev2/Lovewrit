"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Search,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Clock,
  Package,
  LogOut,
  Loader2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Send,
  Mail,
  Filter,
  Crown,
  Sparkles,
} from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [masterKey, setMasterKey] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<"orders" | "queue">("orders");

  // Orders and metrics state
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Queue state
  const [queueOrders, setQueueOrders] = useState<any[]>([]);
  const [isRushAvailable, setIsRushAvailable] = useState(true);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Fetch all orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setStats(data.stats || null);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoadingOrders(false);
      setCheckingAuth(false);
    }
  };

  // Fetch queue
  const fetchQueue = async () => {
    setLoadingQueue(true);
    try {
      const res = await fetch("/api/admin/queue");
      const data = await res.json();
      if (res.ok) {
        setQueueOrders(data.orders || []);
        setIsRushAvailable(Boolean(data.isRushAvailable));
      }
    } catch (err) {
      console.error("Queue fetch error:", err);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchQueue();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid master key");

      setIsAuthenticated(true);
      fetchOrders();
      fetchQueue();
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setIsAuthenticated(false);
  };

  // Toggle Rush availability
  const toggleRushSetting = async () => {
    try {
      const nextVal = !isRushAvailable;
      setIsRushAvailable(nextVal);
      await fetch("/api/admin/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_RUSH", isRushAvailable: nextVal }),
      });
    } catch (err) {
      console.error("Failed to toggle rush availability", err);
    }
  };

  // Update order in queue
  const updateQueueStatus = async (orderId: string, founderStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await fetch("/api/admin/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UPDATE_ORDER", orderId, founderStatus }),
      });
      fetchQueue();
      fetchOrders();
    } catch (err) {
      console.error("Failed to update queue order", err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const copySlugUrl = (slug: string, isCard: boolean) => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const url = `${origin}/${isCard ? "c" : "p"}/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(slug);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  // Not authenticated screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
            <Shield className="h-7 w-7" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-white text-center">
            Memoir Founder Portal
          </h2>
          <p className="mt-2 text-xs text-neutral-400 text-center">
            Enter your isolated founder master key to inspect orders and fulfillment queue.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            {loginError && (
              <div className="flex items-center space-x-2 rounded-xl bg-red-950/80 border border-red-800 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Founder Master Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-rose-500 focus:outline-none"
                />
                <Lock className="absolute right-3.5 top-3.5 h-4 w-4 text-neutral-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="flex w-full items-center justify-center rounded-xl bg-rose-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-rose-500 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Authenticate Dashboard</span>
              )}
            </button>
          </form>

          {/* Quick-Access Key Helper (Addressing User Feedback) */}
          <div className="mt-5 rounded-2xl border border-rose-500/20 bg-neutral-950/90 p-3.5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-300">
                Default Founder Secret Key:
              </span>
              <button
                type="button"
                onClick={() => setMasterKey("memoir_master_founder_secret_2026")}
                className="rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300 hover:bg-rose-500/30 transition"
              >
                Auto-Fill Key
              </button>
            </div>
            <code className="mt-1.5 block rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-mono text-rose-300 select-all border border-neutral-800">
              memoir_master_founder_secret_2026
            </code>
            <p className="mt-1.5 text-[10px] text-neutral-500">
              Configured in your local <code className="text-neutral-400">.env</code> file under <code className="text-neutral-400">ADMIN_MASTER_KEY</code>.
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition">
              ← Return to public site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-neutral-900 bg-neutral-900/60 px-4 py-4 sm:px-8 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white font-serif font-bold text-sm">
              M
            </div>
            <div>
              <span className="font-serif font-bold text-white text-base">
                Memoir Founder Dashboard
              </span>
              <span className="hidden sm:inline ml-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 font-medium">
                Phase 2 Commercial Edition
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/create/be-my-girlfriend?founderKey=memoir_master_founder_secret_2026"
              className="inline-flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 px-3.5 py-1.5 text-xs font-bold text-neutral-950 hover:opacity-95 shadow-md shadow-amber-500/20 transition"
            >
              <Crown className="h-3.5 w-3.5" />
              <span>Create Free Memoir (Founder Pass)</span>
            </Link>
            <Link
              href="/"
              className="text-xs text-neutral-400 hover:text-white transition px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900"
            >
              Public Site
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-xs text-neutral-400 hover:text-rose-400 transition px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-8 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-neutral-800 pb-4">
          <button
            onClick={() => setActiveTab("orders")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "orders"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "text-neutral-400 hover:text-white bg-neutral-900"
            }`}
          >
            All Orders & Revenue
          </button>
          <button
            onClick={() => setActiveTab("queue")}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "queue"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                : "text-neutral-400 hover:text-white bg-neutral-900"
            }`}
          >
            <span>Fulfillment Queue (Custom & Rush)</span>
            {queueOrders.filter((o) => o.founderStatus !== "COMPLETED").length > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.2 text-[10px] text-white font-bold animate-pulse">
                {queueOrders.filter((o) => o.founderStatus !== "COMPLETED").length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: ALL ORDERS & METRICS */}
        {activeTab === "orders" && (
          <div className="space-y-8">
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Total Orders
                    </span>
                    <Package className="h-4 w-4 text-rose-400" />
                  </div>
                  <div className="mt-3 text-3xl font-bold text-white">
                    {stats.totalOrders}
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-400">
                    {stats.paidOrders} paid • {stats.pendingOrders} pending
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Revenue (INR)
                    </span>
                    <span className="text-emerald-400 font-bold">₹</span>
                  </div>
                  <div className="mt-3 text-3xl font-bold text-emerald-400">
                    ₹{(stats.revenueByCurrency?.INR / 100 || 0).toLocaleString()}
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-400">Asia & Africa region</div>
                </div>

                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Revenue (USD)
                    </span>
                    <span className="text-emerald-400 font-bold">$</span>
                  </div>
                  <div className="mt-3 text-3xl font-bold text-emerald-400">
                    ${(stats.revenueByCurrency?.USD / 100 || 0).toLocaleString()}
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-400">Americas region</div>
                </div>

                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                      Revenue (EUR & GBP)
                    </span>
                    <span className="text-emerald-400 font-bold">€ / £</span>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-emerald-400">
                    €{(stats.revenueByCurrency?.EUR / 100 || 0)} / £{(stats.revenueByCurrency?.GBP / 100 || 0)}
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-400">Europe & UK regions</div>
                </div>
              </div>
            )}

            {/* Orders Table Container */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">
                    Customer Orders
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Inspect customer creations, preview finished links, and track fulfillments.
                  </p>
                </div>

                {/* Filter controls */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search email, name or slug..."
                      className="rounded-xl border border-neutral-700 bg-neutral-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                    />
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PAID">Paid Only</option>
                    <option value="PENDING">Pending Only</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="border-b border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-400">
                    <tr>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Tier & Occasion</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-neutral-500">
                          No orders found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => {
                        const isCard = order.productType === "CARD";
                        const names = isCard
                          ? `${order.cardData?.senderName || "Unknown"} & ${order.cardData?.recipientName || "Unknown"}`
                          : `${order.pageData?.senderName || "Unknown"} & ${order.pageData?.recipientName || "Unknown"}`;
                        const occasionTag = isCard
                          ? order.cardData?.occasion
                          : order.pageData?.occasion;

                        return (
                          <tr key={order.id} className="hover:bg-neutral-800/40 transition">
                            <td className="py-3.5 px-3 text-neutral-400 whitespace-nowrap">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="font-semibold text-white">{order.customerName}</div>
                              <div className="text-[11px] text-neutral-400">{order.customerEmail}</div>
                            </td>
                            <td className="py-3.5 px-3">
                              <div className="flex items-center space-x-1.5">
                                <span className="font-medium text-neutral-200">
                                  {isCard ? "Digital Card" : "Page"}
                                </span>
                                {order.tier === "RUSH" ? (
                                  <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[9px] font-bold text-red-400">
                                    RUSH
                                  </span>
                                ) : order.tier === "CUSTOM" ? (
                                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                                    CUSTOM
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[9px] text-neutral-400">
                                    SELF
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-rose-400/80 capitalize">
                                {names} • {occasionTag}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-white">
                              {order.currency} {(order.amountTotal / 100).toFixed(2)}
                            </td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  order.status === "PAID"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => copySlugUrl(order.slug, isCard)}
                                  className="rounded-lg border border-neutral-700 bg-neutral-800 p-1.5 text-neutral-300 hover:text-white"
                                  title="Copy URL"
                                >
                                  {copiedId === order.slug ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>

                                <Link
                                  href={`/${isCard ? "c" : "p"}/${order.slug}`}
                                  target="_blank"
                                  className="inline-flex items-center space-x-1 rounded-lg bg-rose-600/20 border border-rose-500/30 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-600 hover:text-white transition"
                                >
                                  <span>View</span>
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FOUNDER FULFILLMENT QUEUE (PHASE 2 UPGRADE) */}
        {activeTab === "queue" && (
          <div className="space-y-6">
            {/* Rush Availability Switch Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between rounded-3xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-xl gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-amber-400" />
                  <h3 className="font-serif text-lg font-bold text-white">
                    Emergency Rush Orders Availability Switch
                  </h3>
                </div>
                <p className="mt-1 text-xs text-neutral-400 max-w-xl leading-relaxed">
                  Turn OFF whenever travelling or sleeping to safely pause emergency rush bookings and avoid unfulfilled turnaround promises.
                </p>
              </div>

              <button
                onClick={toggleRushSetting}
                className={`flex items-center space-x-2 rounded-2xl px-5 py-3 text-xs font-bold transition shadow-lg ${
                  isRushAvailable
                    ? "bg-emerald-600 text-white shadow-emerald-600/25"
                    : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                }`}
              >
                {isRushAvailable ? (
                  <>
                    <ToggleRight className="h-5 w-5 text-white" />
                    <span>RUSH ORDERS: ACTIVE</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-5 w-5 text-neutral-500" />
                    <span>RUSH ORDERS: PAUSED</span>
                  </>
                )}
              </button>
            </div>

            {/* Queue Cards */}
            <div className="space-y-4">
              {loadingQueue ? (
                <div className="py-12 text-center text-xs text-neutral-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-rose-500 mb-2" />
                  <span>Loading fulfillment queue...</span>
                </div>
              ) : queueOrders.length === 0 ? (
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 text-center text-xs text-neutral-400">
                  <Check className="h-8 w-8 mx-auto text-emerald-400 mb-3" />
                  <h4 className="text-base font-bold text-white">Queue is clear!</h4>
                  <p className="mt-1">No custom or rush orders waiting for review.</p>
                </div>
              ) : (
                queueOrders.map((order) => {
                  const isRush = order.tier === "RUSH";
                  const isDone = order.founderStatus === "COMPLETED";

                  return (
                    <div
                      key={order.id}
                      className={`rounded-3xl border p-6 transition shadow-xl ${
                        isDone
                          ? "border-neutral-800 bg-neutral-900/40 opacity-70"
                          : isRush
                          ? "border-red-500/50 bg-red-950/20 shadow-red-950/30"
                          : "border-amber-500/40 bg-amber-950/20"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4 mb-4">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                              isRush
                                ? "bg-red-500 text-white animate-pulse"
                                : "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                            }`}
                          >
                            {isRush ? "EMERGENCY RUSH (SAME-DAY)" : "CUSTOM TIER (24-48H)"}
                          </span>
                          <span className="text-xs text-neutral-400">
                            Ordered {new Date(order.createdAt).toLocaleTimeString()} • {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-neutral-400">Founder Status:</span>
                          <select
                            value={order.founderStatus}
                            onChange={(e) => updateQueueStatus(order.id, e.target.value)}
                            disabled={updatingOrderId === order.id}
                            className="rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-1 text-xs text-white focus:outline-none"
                          >
                            <option value="QUEUED">QUEUED (New)</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="COMPLETED">COMPLETED (Fulfilled)</option>
                          </select>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <div className="text-[11px] text-neutral-400 uppercase font-semibold">
                            Customer Info
                          </div>
                          <div className="font-bold text-white mt-1">{order.customerName}</div>
                          <div className="text-neutral-300">{order.customerEmail}</div>
                          <div className="mt-2">
                            <a
                              href={`mailto:${order.customerEmail}?subject=Your Memoir Order [${order.slug}]`}
                              className="inline-flex items-center space-x-1 text-rose-400 hover:text-rose-300 text-[11px]"
                            >
                              <Mail className="h-3 w-3" />
                              <span>Email Customer</span>
                            </a>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <div className="text-[11px] text-neutral-400 uppercase font-semibold">
                            Customer Instructions & Custom Notes
                          </div>
                          <div className="mt-1 rounded-2xl border border-neutral-800 bg-neutral-950 p-3.5 text-xs text-neutral-200 font-serif whitespace-pre-wrap leading-relaxed">
                            {order.customNotes || "No special custom notes provided. Proceed with standard template polish."}
                          </div>
                        </div>
                      </div>

                      {/* Quick links & preview */}
                      <div className="mt-4 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                        <div className="text-neutral-400">
                          Product: <strong className="text-white">{order.productType}</strong> • Amount Paid:{" "}
                          <strong className="text-emerald-400">{order.currency} {(order.amountTotal / 100).toFixed(2)}</strong>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/${order.productType === "CARD" ? "c" : "p"}/${order.slug}`}
                            target="_blank"
                            className="inline-flex items-center space-x-1 rounded-xl bg-neutral-800 px-3 py-1.5 text-neutral-200 hover:text-white"
                          >
                            <span>Open Page</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
