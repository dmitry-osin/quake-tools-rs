import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ALL_ITEM_TYPES, getSpawnSeconds, ITEM_META } from "../data/gameData";
import type { Game, ItemType } from "../types/domain";

type TrainerPageProps = {
  game: Game;
};

type Question = {
  itemType: ItemType;
  pickupSec: number;
  spawnSec: number;
  correctSec: number;
};

type Result = {
  isCorrect: boolean;
  userSec: number;
  correctSec: number;
  formula: string;
};

function randomPickup(): number {
  return Math.floor(Math.random() * 12) * 5;
}

function nextQuestion(game: Game): Question {
  const itemType = ALL_ITEM_TYPES[Math.floor(Math.random() * ALL_ITEM_TYPES.length)];
  const pickupSec = randomPickup();
  const spawnSec = getSpawnSeconds(game, itemType);
  const correctSec = (pickupSec + spawnSec) % 60;

  return { itemType, pickupSec, spawnSec, correctSec };
}

export function TrainerPage({ game }: TrainerPageProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  const accuracy = useMemo(() => (total === 0 ? 0 : Math.round((correct / total) * 100)), [correct, total]);

  const start = () => {
    setActive(true);
    setQuestion(nextQuestion(game));
    setAnswer("");
    setResult(null);
    setCorrect(0);
    setTotal(0);
  };

  const end = () => {
    setActive(false);
    setQuestion(null);
    setAnswer("");
    setResult(null);
    setCorrect(0);
    setTotal(0);
  };

  const submit = () => {
    if (!question || result) {
      return;
    }

    const userSec = Number.parseInt(answer, 10);
    if (Number.isNaN(userSec) || userSec < 0 || userSec > 59) {
      return;
    }

    const isCorrect = userSec === question.correctSec;
    const formula = `(${question.pickupSec} + ${question.spawnSec}) % 60 = ${question.correctSec}`;

    setTotal((value) => value + 1);
    if (isCorrect) {
      setCorrect((value) => value + 1);
    }

    setResult({ isCorrect, userSec, correctSec: question.correctSec, formula });
  };

  const next = () => {
    setQuestion(nextQuestion(game));
    setAnswer("");
    setResult(null);
  };

  return (
    <section className="panel space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="panel-title mb-0">{t("trainer.title")}</h2>
        <span className="text-sm font-semibold text-[var(--t2)]">{correct} / {total}</span>
      </div>

      <progress className="h-2 w-full" value={accuracy} max={100} />
      <div className="text-xs text-[var(--t3)]">{t("trainer.accuracy")}: {accuracy}%</div>

      {!active ? (
        <button type="button" className="nav-item nav-item-active" onClick={start}>
          {t("trainer.start")}
        </button>
      ) : null}

      {active && question ? (
        <div className="space-y-3">
          <div className="rounded border border-[var(--border2)] bg-[var(--surface2)] p-2 text-sm">
            <div>{t("trainer.item")}: {ITEM_META[question.itemType].label}</div>
            <div>{t("trainer.pickup")}: {question.pickupSec} sec</div>
            <div>{t("trainer.spawn")}: {question.spawnSec} sec</div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={59}
              value={answer}
              onChange={(event) => setAnswer(event.currentTarget.value)}
              className="w-24 rounded border border-[var(--border2)] bg-[var(--surface2)] px-2 py-1"
              placeholder="0-59"
            />
            <button type="button" className="nav-item w-auto" onClick={submit}>
              {t("trainer.check")}
            </button>
            <button type="button" className="nav-item w-auto" onClick={end}>
              {t("trainer.end")}
            </button>
          </div>

          {result ? (
            <div className="rounded border border-[var(--border2)] bg-[var(--surface2)] p-2 text-sm">
              <div className={result.isCorrect ? "text-emerald-300" : "text-rose-300"}>
                {result.isCorrect ? t("trainer.correct") : t("trainer.incorrect")}
              </div>
              <div>{t("trainer.yourAnswer")}: {result.userSec}</div>
              <div>{t("trainer.rightAnswer")}: {result.correctSec}</div>
              <div className="text-[var(--t2)]">{result.formula}</div>
              <button type="button" className="nav-item mt-2 w-auto" onClick={next}>
                {t("trainer.next")}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
