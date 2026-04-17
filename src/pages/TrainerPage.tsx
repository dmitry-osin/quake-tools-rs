import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ALL_ITEM_TYPES, DEFAULT_HOTKEY_BY_ITEM, getSpawnSeconds, ITEM_META } from "../data/gameData";
import { TimerCard } from "../components/TimerCard";
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
};

function randomPickup(): number {
  return Math.floor(Math.random() * 60);
}

function nextQuestion(game: Game, previous: Question | null): Question {
  let attempts = 0;

  while (attempts < 10) {
    const itemType = ALL_ITEM_TYPES[Math.floor(Math.random() * ALL_ITEM_TYPES.length)];
    const pickupSec = randomPickup();
    const spawnSec = getSpawnSeconds(game, itemType);
    const correctSec = (pickupSec + spawnSec) % 60;
    const candidate = { itemType, pickupSec, spawnSec, correctSec };

    if (!previous || previous.itemType !== candidate.itemType || previous.pickupSec !== candidate.pickupSec) {
      return candidate;
    }

    attempts += 1;
  }

  const itemType = ALL_ITEM_TYPES[Math.floor(Math.random() * ALL_ITEM_TYPES.length)];
  const pickupSec = randomPickup();
  const spawnSec = getSpawnSeconds(game, itemType);
  const correctSec = (pickupSec + spawnSec) % 60;
  return { itemType, pickupSec, spawnSec, correctSec };
}

export function TrainerPage({ game }: TrainerPageProps) {
  const { t } = useTranslation();
  const [trainerGame, setTrainerGame] = useState<Game>(game);
  const [active, setActive] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [lastResult, setLastResult] = useState<Result | null>(null);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  const accuracy = useMemo(() => (total === 0 ? 0 : Math.round((correct / total) * 100)), [correct, total]);

  const start = () => {
    setActive(true);
    setQuestion(nextQuestion(trainerGame, null));
    setAnswer("");
    setLastResult(null);
    setCorrect(0);
    setTotal(0);
  };

  const switchGame = (nextGame: Game) => {
    setTrainerGame(nextGame);
    setActive(false);
    setQuestion(null);
    setAnswer("");
    setLastResult(null);
    setCorrect(0);
    setTotal(0);
  };

  const end = () => {
    setActive(false);
    setQuestion(null);
    setAnswer("");
    setLastResult(null);
    setCorrect(0);
    setTotal(0);
  };

  const submit = () => {
    if (!question) {
      return;
    }

    const userSec = Number.parseInt(answer, 10);
    if (Number.isNaN(userSec) || userSec < 0 || userSec > 59) {
      return;
    }

    const isCorrect = userSec === question.correctSec;

    setTotal((value) => value + 1);
    if (isCorrect) {
      setCorrect((value) => value + 1);
    }

    setLastResult({ isCorrect, userSec, correctSec: question.correctSec });
    setQuestion(nextQuestion(trainerGame, question));
    setAnswer("");
  };

  return (
    <section className="panel space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="panel-title mb-0">{t("trainer.title")}</h2>
        <span className="text-sm font-semibold text-[var(--t2)]">{correct} / {total}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={trainerGame === "QuakeLive" ? "nav-item nav-item-active" : "nav-item"}
          onClick={() => switchGame("QuakeLive")}
        >
          {t("main.ql")}
        </button>
        <button
          type="button"
          className={trainerGame === "QuakeChampions" ? "nav-item nav-item-active" : "nav-item"}
          onClick={() => switchGame("QuakeChampions")}
        >
          {t("main.qc")}
        </button>
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
          <TimerCard
            label={ITEM_META[question.itemType].label}
            hotkey={DEFAULT_HOTKEY_BY_ITEM[question.itemType]}
            icon={ITEM_META[question.itemType].icon}
            color={ITEM_META[question.itemType].color}
            spawnSeconds={question.spawnSec}
            status="Idle"
            displayValue={`${question.pickupSec}`}
            remainingLabel={`${t("trainer.pickup")}: ${question.pickupSec}s`}
            progressPercent={0}
            alertColor={null}
            effectClassName=""
            onActivate={() => {
              // Trainer card is informational only.
            }}
          />
          <div className="rounded border border-[var(--border2)] bg-[var(--surface2)] p-2 text-sm text-[var(--t2)]">
            {t("trainer.spawn")}: {question.spawnSec} sec
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

          {lastResult ? (
            <div className="rounded border border-[var(--border2)] bg-[var(--surface2)] p-2 text-sm">
              <div className={lastResult.isCorrect ? "text-emerald-300" : "text-rose-300"}>
                {lastResult.isCorrect ? t("trainer.correct") : t("trainer.incorrect")}
              </div>
              <div>{t("trainer.yourAnswer")}: {lastResult.userSec}</div>
              <div>{t("trainer.rightAnswer")}: {lastResult.correctSec}</div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
