"use client";

import { MessageCircle, Send, ExternalLink } from "lucide-react";

const BOT_USERNAME = "cph_deal_finder_bot";
const BOT_LINK = `https://t.me/${BOT_USERNAME}`;

export function TelegramBanner() {
  return (
    <div className="mt-10 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-sky-100 p-2 dark:bg-sky-900">
            <Send className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Get deals on Telegram
            </h3>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              New deals delivered to your phone at 08:00 & 18:00. Browse with
              interactive commands like{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
                /deals
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
                /food 200
              </code>
              , or{" "}
              <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-800">
                /expiring
              </code>
              .
            </p>
          </div>
        </div>
        <a
          href={BOT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-600 whitespace-nowrap"
        >
          <MessageCircle className="h-4 w-4" />
          Open in Telegram
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
        <span>
          @{BOT_USERNAME}
        </span>
        <span>|</span>
        <span>
          Direct link:{" "}
          <a
            href={BOT_LINK}
            className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            t.me/{BOT_USERNAME}
          </a>
        </span>
      </div>
    </div>
  );
}
