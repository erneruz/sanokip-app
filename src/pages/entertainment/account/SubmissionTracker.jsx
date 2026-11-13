// src/pages/entertainment/account/SubmissionTracker.jsx
// The progress line of a submission: Submitted > In review > Verified > Visit >
// Shoot > Profile > Published > Documentary. The green line fills up to where the
// submission stands; the current step pulses.
import { STAGES, stageIndex } from '../../../constants/talentJourney'
import { TIcon } from './talentUi'

export default function SubmissionTracker({ status }) {
  const idx = stageIndex(status)
  const stopped = status === 'rejected'
  const n = STAGES.length
  const current = idx >= 0 ? STAGES[idx] : null

  if (idx < 0) return null // withdrawn: no progress line

  return (
    <div>
      <div className="relative">
        {/* the rail goes from the middle of the first step to the middle of the last */}
        <div className="absolute inset-x-[6.25%] top-4 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-gray-200">
          <div
            className={'trk-fill h-full rounded-full ' + (stopped ? 'bg-red-400' : 'bg-gradient-to-r from-[#1B5E4F] to-[#2F9678]')}
            style={{ width: `${(idx / (n - 1)) * 100}%` }}
          />
        </div>

        <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {STAGES.map((st, i) => {
            const done = i < idx || (i === idx && !stopped && status !== 'needs_info')
            const here = i === idx
            const waiting = here && status === 'needs_info'
            const stoppedHere = here && stopped
            return (
              <li key={st.key} className="flex flex-col items-center text-center">
                <span
                  className={
                    'flex size-8 items-center justify-center rounded-full text-[11px] font-bold transition-colors ' +
                    (stoppedHere
                      ? 'bg-red-500 text-white'
                      : waiting
                        ? 'trk-now bg-amber-400 text-white'
                        : done
                          ? 'bg-[#1B5E4F] text-white'
                          : here
                            ? 'trk-now bg-white text-[#1B5E4F] ring-2 ring-[#2F9678]'
                            : 'bg-white text-gray-400 ring-2 ring-gray-200')
                  }
                  title={st.label}
                >
                  {stoppedHere ? (
                    <TIcon name="close" size={14} strokeWidth={3} />
                  ) : waiting ? (
                    <TIcon name="clock" size={14} strokeWidth={2.6} />
                  ) : done ? (
                    <TIcon name="check" size={14} strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={
                    'mt-2 hidden px-0.5 text-[11px] leading-tight sm:block ' +
                    (here ? 'font-semibold text-[#0F3D32]' : done ? 'font-medium text-gray-600' : 'text-gray-400')
                  }
                >
                  {st.label}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      {/* on a phone the labels are hidden, so the current step is written below */}
      {current && (
        <p className="mt-3 text-center text-xs font-semibold text-[#0F3D32] sm:hidden">
          Step {idx + 1} of {n}: {current.label}
        </p>
      )}
    </div>
  )
}