import { Check, Circle, Info } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getCvarDetail,
  listCvarCategories,
  queryCvars,
  type CvarCategorySummary,
  type CvarDetail,
  type CvarSearchResult,
} from "../services/cvarsService";

const PAGE_SIZE = 7;
const CVARS_INFO_SEEN_KEY = "quake-tools:cvars-info-seen";

const CATEGORY_COLOR_CLASSES = [
  "text-emerald-400",
  "text-cyan-400",
  "text-amber-400",
  "text-rose-400",
  "text-violet-400",
  "text-lime-400",
  "text-sky-400",
];

function categoryColorClass(category: string): string {
  let hash = 0;

  for (let index = 0; index < category.length; index += 1) {
    hash = (hash * 31 + category.charCodeAt(index)) >>> 0;
  }

  return CATEGORY_COLOR_CLASSES[hash % CATEGORY_COLOR_CLASSES.length];
}

export function CvarsPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<CvarCategorySummary[]>([]);
  const [results, setResults] = useState<CvarSearchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selected, setSelected] = useState<CvarDetail | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copyResetTimeoutRef = useRef<number | null>(null);

  const normalizedQuery = query.trim();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    try {
      if (window.localStorage.getItem(CVARS_INFO_SEEN_KEY) !== "1") {
        setInfoOpen(true);
        window.localStorage.setItem(CVARS_INFO_SEEN_KEY, "1");
      }
    } catch {
      // Ignore storage availability issues.
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        setCategories(await listCvarCategories());
      } catch {
        setError(t("cvars.loadError"));
      }
    })();
  }, [t]);

  const loadPage = async (inputQuery: string, targetPage: number) => {
    setError(null);
    setLoading(true);

    const queryForBackend = inputQuery.length >= 3 ? inputQuery : null;

    try {
      const response = await queryCvars(queryForBackend, selectedCategory || null, targetPage, PAGE_SIZE);
      setResults(response.items);
      setTotal(response.total);
    } catch {
      setError(t("cvars.searchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event?: FormEvent) => {
    event?.preventDefault();
    setPage(1);

    if (normalizedQuery.length > 0 && normalizedQuery.length < 3) {
      setResults([]);
      setTotal(0);
      return;
    }

    await loadPage(normalizedQuery, 1);
  };

  const handleOpenDetails = async (name: string) => {
    try {
      const details = await getCvarDetail(name);
      if (details) {
        setSelected(details);
      }
    } catch {
      setError(t("cvars.detailsError"));
    }
  };

  const handleCopy = async () => {
    if (!selected) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selected.name);
      setCopySuccess(true);

      if (copyResetTimeoutRef.current !== null) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }

      copyResetTimeoutRef.current = window.setTimeout(() => {
        setCopySuccess(false);
        copyResetTimeoutRef.current = null;
      }, 1000);
    } catch {
      setError(t("cvars.copyError"));
    }
  };

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current !== null) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setCopySuccess(false);
  }, [selected]);

  useEffect(() => {
    if (normalizedQuery.length > 0 && normalizedQuery.length < 3) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadPage(normalizedQuery, page);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [normalizedQuery, page, selectedCategory]);

  useEffect(() => {
    setPage(1);
  }, [normalizedQuery, selectedCategory]);

  return (
    <section className="space-y-3">
      <section className="panel space-y-2">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="panel-title mb-0">{t("cvars.title")}</h2>
          <button className="icon-button" type="button" aria-label={t("cvars.infoAria")} onClick={() => setInfoOpen(true)}>
            <Info size={14} />
          </button>
        </div>
        <form className="flex gap-2" onSubmit={(event) => void handleSearch(event)}>
          <input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder={t("cvars.searchPlaceholder")}
            className="w-full rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-1 text-sm"
          />
        </form>
        <div className="text-right text-[11px] text-[var(--t3)]">{t("cvars.autoSearchHint")}</div>
        <label className="flex items-center gap-2 text-xs text-[var(--t2)]">
          <span>{t("cvars.categoryFilter")}</span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.currentTarget.value)}
            className="w-full rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-1 text-xs"
          >
            <option value="">{t("cvars.allCategories")}</option>
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        {error ? <div className="text-xs text-rose-300">{error}</div> : null}
        {normalizedQuery.length > 0 && normalizedQuery.length < 3 ? (
          <div className="text-xs text-amber-300">{t("cvars.minChars")}</div>
        ) : null}
      </section>

      <section className="panel space-y-2">
        <h2 className="panel-title">{t("cvars.results")}</h2>
        {loading ? <div className="text-xs text-[var(--t3)]">{t("cvars.loading")}</div> : null}
        {!loading && results.length === 0 ? <div className="text-xs text-[var(--t3)]">{t("cvars.noResults")}</div> : null}
        <div className="grid gap-2">
          {results.map((result) => (
            <button
              key={`${result.category}-${result.name}`}
              className="rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-2 text-left text-xs"
              type="button"
              onClick={() => void handleOpenDetails(result.name)}
            >
              <div className="text-sm text-[var(--t1)]">{result.name}</div>
              <div className="text-[var(--t3)]">{result.friendlyName ?? "-"}</div>
              <div className="mt-1 flex items-center gap-1 text-[var(--t2)]">
                <Circle size={10} className={`fill-current ${categoryColorClass(result.category)}`} />
                <span>{result.category}</span>
              </div>
            </button>
          ))}
        </div>
        {total > 0 ? (
          <div className="mt-2 flex items-center justify-between text-xs text-[var(--t2)]">
            <span>
              {t("cvars.page")} {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="nav-item w-auto"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
              >
                {t("cvars.prev")}
              </button>
              <button
                type="button"
                className="nav-item w-auto"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
              >
                {t("cvars.next")}
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {selected ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-lg border border-[var(--border2)] bg-[var(--surface)] p-4">
            <h2 className="panel-title mb-2">{selected.name}</h2>
            <div className="overflow-hidden rounded border border-[var(--border2)]">
              <table className="w-full text-left text-xs">
                <tbody>
                  <tr className="border-b border-[var(--border2)] bg-[var(--surface2)]">
                    <th className="w-40 px-2 py-1 font-medium text-[var(--t3)]">{t("cvars.friendlyName")}</th>
                    <td className="px-2 py-1 text-[var(--t2)]">{selected.friendlyName ?? "-"}</td>
                  </tr>
                  <tr className="border-b border-[var(--border2)]">
                    <th className="w-40 px-2 py-1 font-medium text-[var(--t3)]">{t("cvars.category")}</th>
                    <td className="px-2 py-1 text-[var(--t2)]">{selected.category}</td>
                  </tr>
                  <tr className="border-b border-[var(--border2)] bg-[var(--surface2)]">
                    <th className="w-40 px-2 py-1 font-medium text-[var(--t3)]">{t("cvars.defaultValue")}</th>
                    <td className="px-2 py-1 text-[var(--t2)]">{selected.defaultValue ?? "-"}</td>
                  </tr>
                  <tr className="border-b border-[var(--border2)]">
                    <th className="w-40 px-2 py-1 font-medium text-[var(--t3)]">{t("cvars.dataType")}</th>
                    <td className="px-2 py-1 text-[var(--t2)]">{selected.dataType ?? "-"}</td>
                  </tr>
                  <tr className="bg-[var(--surface2)]">
                    <th className="w-40 px-2 py-1 font-medium text-[var(--t3)]">{t("cvars.performanceImpact")}</th>
                    <td className="px-2 py-1 text-[var(--t2)]">{selected.performanceImpact ?? "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-sm text-[var(--t2)]">{selected.description ?? selected.shortDescription ?? "-"}</p>

            {selected.proTip ? (
              <div className="mt-3 rounded border border-[var(--border2)] bg-[var(--surface2)] p-2 text-xs text-[var(--t2)]">
                <div className="mb-1 uppercase tracking-[0.16em] text-[var(--t3)]">{t("cvars.proTip")}</div>
                <p>{selected.proTip}</p>
              </div>
            ) : null}

            {selected.availableSettings.length > 0 ? (
              <div className="mt-3 space-y-1 text-xs text-[var(--t2)]">
                <div className="uppercase tracking-[0.16em] text-[var(--t3)]">{t("cvars.availableSettings")}</div>
                <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
                  {selected.availableSettings.map((entry) => (
                    <div key={`${selected.name}-${entry.value}`} className="rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-1">
                      <span className="text-[var(--t1)]">{entry.value}</span>
                      <span className="text-[var(--t3)]"> - {entry.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="nav-item nav-item-active w-auto"
                onClick={() => {
                  if (selected.url) {
                    void openUrl(selected.url);
                  }
                }}
              >
                {t("cvars.openWebsite")}
              </button>
              <button type="button" className="nav-item w-auto" onClick={() => void handleCopy()}>
                <span className="flex items-center gap-1">
                  {copySuccess ? <Check size={14} className="text-emerald-400" /> : null}
                  <span>{copySuccess ? t("cvars.copied") : t("cvars.copyVariable")}</span>
                </span>
              </button>
              <button type="button" className="nav-item w-auto" onClick={() => setSelected(null)}>
                {t("cvars.close")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {infoOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-lg border border-[var(--border2)] bg-[var(--surface)] p-4">
            <h2 className="panel-title mb-2">{t("cvars.infoTitle")}</h2>
            <div className="space-y-2 text-sm text-[var(--t2)]">
              <p>
                {t("cvars.infoLine1")} {" "}
                <a
                  href="https://quakeliveconfigeditor.com/cvars/"
                  className="text-cyan-300 underline"
                  onClick={(event) => {
                    event.preventDefault();
                    void openUrl("https://quakeliveconfigeditor.com/cvars/");
                  }}
                >
                  https://quakeliveconfigeditor.com/cvars/
                </a>
              </p>
              <p>
                {t("cvars.infoLine2")} {" "}
                <a
                  href="https://quakeliveconfigeditor.com/"
                  className="text-cyan-300 underline"
                  onClick={(event) => {
                    event.preventDefault();
                    void openUrl("https://quakeliveconfigeditor.com/");
                  }}
                >
                  https://quakeliveconfigeditor.com/
                </a>
              </p>
              <p>
                {t("cvars.infoLine3")} {" "}
                <a
                  href="https://bassettgraphics.com/"
                  className="text-cyan-300 underline"
                  onClick={(event) => {
                    event.preventDefault();
                    void openUrl("https://bassettgraphics.com/");
                  }}
                >
                  https://bassettgraphics.com/
                </a>
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="nav-item w-auto" onClick={() => setInfoOpen(false)}>
                {t("cvars.close")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
