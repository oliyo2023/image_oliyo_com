"use client";

import { NextIntlClientProvider } from "next-intl";
import enMessages from "../../../messages/en.json";

type IntlProviderProps = {
  locale: string;
  messages: Record<string, any>;
  formats?: Record<string, any>;
  timeZone?: string;
  now?: Date;
  children: React.ReactNode;
};

export default function IntlProvider({
  locale,
  messages,
  formats,
  timeZone,
  now,
  children,
}: IntlProviderProps) {
  // 规范化 now 为 Date，避免类型不匹配
  const nowDate =
    typeof now === "string" || typeof now === "number" ? new Date(now) : now;

  const getMessageFallback = (info: {
    key: string;
    namespace?: string;
  }) => {
    const key = info.key;
    const ns = info.namespace;

    // 当 namespace 未定义时，尝试在英文根级找到 key，否则给出占位
    if (typeof ns !== "string" || !ns) {
      const root = enMessages as Record<string, any>;
      const val = root && typeof root[key] === "string" ? root[key] : undefined;
      return typeof val === "string" ? val : key;
    }

    // 有 namespace 时，先查英文兜底
    const dict = enMessages as Record<string, any>;
    const nsObj = dict[ns] as Record<string, any> | undefined;
    const enVal =
      nsObj && typeof nsObj[key] === "string" ? (nsObj[key] as string) : undefined;

    if (typeof enVal === "string") return enVal;

    // 再尝试当前 messages 里是否有该值（防御返回）
    const curNsObj = messages[ns] as Record<string, any> | undefined;
    const curVal =
      curNsObj && typeof curNsObj[key] === "string"
        ? (curNsObj[key] as string)
        : undefined;

    return typeof curVal === "string" ? curVal : `${ns}.${key}`;
  };

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      formats={formats}
      timeZone={timeZone}
      now={nowDate}
      getMessageFallback={getMessageFallback}
    >
      {children}
    </NextIntlClientProvider>
  );
}