// src/components/PostReactions.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  submitReaction,
  getVisitorReaction,
  getReactionCounts,
  getPostReactors,
} from '../services/reactionService'
import { getVisitorId } from '../utils/visitorId'
import { useAuth } from '../context/AuthContext'

function fullName(person) {
  return `${person.first_name ?? ''} ${person.last_name ?? ''}`.trim() || 'Member'
}

function initialsOf(name) {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

// "Just now", "5 minutes ago", "3 hours ago", "2 days ago", or the date
function timeAgo(dateString, now) {
  const seconds = Math.max(0, Math.floor((now - new Date(dateString).getTime()) / 1000))

  if (seconds < 60) return 'Just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Exact moment, e.g. "Nov 7, 2026, 6:30 PM"
function exactTime(dateString) {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Clock time only, e.g. "6:30 PM"
function clockTime(dateString) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Group heading: Today / Yesterday / date
function dayLabel(dateString, now) {
  const date = new Date(dateString)
  const today = new Date(now)

  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOf(today) - startOf(date)) / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// Round picture, or green initials when there is none
function PersonAvatar({ person, size = 'h-8 w-8', text = 'text-[11px]', className = '' }) {
  const [failed, setFailed] = useState(false)
  const name = fullName(person)

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#0F3D32] to-[#1B5E4F] font-bold text-white ${size} ${text} ${className}`}
    >
      {person.avatar_url && !failed ? (
        <img
          src={person.avatar_url}
          alt={name}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initialsOf(name)
      )}
    </span>
  )
}

// Soft colours so each anonymous visitor looks different from the next
const ANON_TINTS = [
  'bg-[#E6F1EE] text-[#1B5E4F]',
  'bg-[#DCE9E5] text-[#14493E]',
  'bg-[#D3EBE3] text-[#2F8F7A]',
  'bg-[#EAF3F0] text-[#0F3D32]',
]

export default function PostReactions({ postId }) {
  const { user } = useAuth()

  const [counts, setCounts] = useState({ likes: 0, dislikes: 0 })
  const [myReaction, setMyReaction] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [reactors, setReactors] = useState([])
  const [showPeople, setShowPeople] = useState(false)
  const [tab, setTab] = useState('all')
  const [now, setNow] = useState(() => Date.now())

  // Signed-in people react with their account (follows them on any device);
  // visitors keep using the anonymous browser id.
  const visitorId = user?.id ?? getVisitorId()

  async function loadReactors() {
    try {
      setReactors(await getPostReactors(postId))
    } catch (err) {
      console.error('Failed to load reactors:', err)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadInitialState() {
      try {
        const [reactionCounts, existingReaction, people] = await Promise.all([
          getReactionCounts(postId),
          getVisitorReaction({ postId, visitorId }),
          getPostReactors(postId),
        ])
        if (cancelled) return
        setCounts(reactionCounts)
        setMyReaction(existingReaction)
        setReactors(people)
      } catch (err) {
        console.error('Failed to load reactions:', err)
      }
    }

    loadInitialState()
    return () => { cancelled = true }
  }, [postId, visitorId])

  // Close the popup with the Escape key and stop the page scrolling behind it
  useEffect(() => {
    if (!showPeople) return

    function onKey(e) {
      if (e.key === 'Escape') setShowPeople(false)
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [showPeople])

  async function handleReact(reaction) {
    if (submitting) return

    const previousReaction = myReaction
    setSubmitting(true)
    setError(null)

    setMyReaction(reaction)
    setCounts((prev) => adjustCounts(prev, previousReaction, reaction))

    try {
      await submitReaction({ postId, visitorId, reaction })
      loadReactors()
    } catch (err) {
      console.error('Failed to save reaction:', err)
      setMyReaction(previousReaction)
      setCounts((prev) => adjustCounts(prev, reaction, previousReaction))
      setError('Unable to save your reaction. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── people who reacted ──────────────────────────────────────
  const byNewest = [...reactors].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const namedPeople = byNewest.filter((r) => r.user_id)
  const total = reactors.length
  const stack = namedPeople.slice(0, 5)
  const extra = total - stack.length

  // Anonymous visitors get a fixed number by arrival order (first one = #1),
  // so the numbers never shift when someone new reacts.
  const anonymousNumber = new Map()
  ;[...byNewest]
    .filter((r) => !r.user_id)
    .reverse()
    .forEach((r, index) => anonymousNumber.set(r, index + 1))

  const tabItems = [
    { key: 'all', label: 'All', count: total },
    { key: 'like', label: 'Likes', count: reactors.filter((r) => r.reaction === 'like').length },
    { key: 'dislike', label: 'Dislikes', count: reactors.filter((r) => r.reaction === 'dislike').length },
  ]

  const visibleReactors = byNewest.filter((r) => tab === 'all' || r.reaction === tab)

  // One timeline, newest first, with a heading for each day
  const groups = []
  visibleReactors.forEach((person) => {
    const label = dayLabel(person.created_at, now)
    const last = groups[groups.length - 1]
    if (last && last.label === label) {
      last.items.push(person)
    } else {
      groups.push({ label, items: [person] })
    }
  })

  // Button look: filled brand green when chosen, soft green tint otherwise
  const buttonClass = (active) =>
    `reaction-btn group flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
      active
        ? 'bg-[#1B5E4F] text-white shadow-md'
        : 'bg-[#E6F1EE] text-[#1B5E4F] ring-1 ring-[#1B5E4F]/15 hover:-translate-y-0.5 hover:bg-[#d8ebe5] hover:shadow-sm'
    }`

  return (
    <div>
      <style>{`
        @keyframes reaction-shake {
          0%, 100% { transform: translateY(-2px) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-8deg); }
          75% { transform: translateY(-2px) rotate(8deg); }
        }
        .reaction-btn:hover .reaction-icon {
          animation: reaction-shake 0.4s ease-in-out;
        }
        @keyframes reactors-pop {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes reactors-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <h3 className="flex items-center gap-2 font-semibold text-[#0D3A31]">
        <BulbIcon className="h-[18px] w-[18px] text-[#2F8F7A]" />
        Was this article helpful?
      </h3>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3">
          <button
            onClick={() => handleReact('like')}
            disabled={submitting}
            className={buttonClass(myReaction === 'like')}
          >
            <ThumbsUpIcon
              className="reaction-icon h-4 w-4"
              filled={myReaction === 'like'}
            />
            Like
            <span className={myReaction === 'like' ? 'text-white/70' : 'text-[#1B5E4F]/60'}>{counts.likes}</span>
          </button>

          <button
            onClick={() => handleReact('dislike')}
            disabled={submitting}
            className={buttonClass(myReaction === 'dislike')}
          >
            <ThumbsDownIcon
              className="reaction-icon h-4 w-4"
              filled={myReaction === 'dislike'}
            />
            Dislike
            <span className={myReaction === 'dislike' ? 'text-white/70' : 'text-[#1B5E4F]/60'}>{counts.dislikes}</span>
          </button>
        </div>

        {/* ── who reacted: overlapping pictures, click to open the list ── */}
        {total > 0 && (
          <button
            type="button"
            onClick={() => {
              setTab('all')
              setNow(Date.now())
              setShowPeople(true)
            }}
            className="group inline-flex cursor-pointer items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-[#E6F1EE]"
            aria-label={`See the ${total} people who reacted`}
          >
            <span className="flex items-center">
              {stack.map((person, index) => (
                <PersonAvatar
                  key={person.user_id}
                  person={person}
                  size="h-8 w-8"
                  className={`ring-2 ring-white transition-transform duration-200 group-hover:translate-x-0.5 ${index > 0 ? '-ml-2.5' : ''}`}
                />
              ))}
              {extra > 0 && (
                <span
                  className={`flex h-8 min-w-8 items-center justify-center rounded-full bg-[#E6F1EE] px-1.5 text-[11px] font-semibold text-[#1B5E4F] ring-2 ring-white ${stack.length > 0 ? '-ml-2.5' : ''}`}
                >
                  +{extra}
                </span>
              )}
            </span>
            <span className="text-sm font-medium text-[#1B5E4F] group-hover:underline">
              {total} {total === 1 ? 'reaction' : 'reactions'}
            </span>
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {/* ── popup: everyone who reacted, newest first ── */}
      {showPeople && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="People who reacted"
        >
          <div
            className="absolute inset-0 bg-[#0D3A31]/60 backdrop-blur-sm"
            style={{ animation: 'reactors-fade 0.2s ease-out' }}
            onClick={() => setShowPeople(false)}
          />

          <div
            className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
            style={{ animation: 'reactors-pop 0.25s ease-out' }}
          >
            {/* header */}
            <div className="flex items-center justify-between bg-gradient-to-br from-[#0D3A31] via-[#14493E] to-[#1B5E4F] px-5 py-4 text-white">
              <h4 className="flex items-center gap-2.5 font-semibold">
                <span className="grid size-8 place-items-center rounded-lg bg-white/15">
                  <UsersIcon className="h-[18px] w-[18px]" />
                </span>
                Reactions
                <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">{total}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowPeople(false)}
                className="grid size-8 cursor-pointer place-items-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white"
                aria-label="Close"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            {/* tabs */}
            <div className="flex gap-1 border-b border-[#1B5E4F]/10 bg-[#F8FBFA] px-3 pt-2">
              {tabItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`-mb-px flex cursor-pointer items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                    tab === item.key
                      ? 'border-[#1B5E4F] text-[#1B5E4F]'
                      : 'border-transparent text-gray-500 hover:text-[#1B5E4F]'
                  }`}
                >
                  {item.key === 'like' && <ThumbsUpIcon className="h-3.5 w-3.5" filled={tab === 'like'} />}
                  {item.key === 'dislike' && <ThumbsDownIcon className="h-3.5 w-3.5" filled={tab === 'dislike'} />}
                  {item.label}
                  <span className="rounded-full bg-[#E6F1EE] px-1.5 text-xs text-[#1B5E4F]">{item.count}</span>
                </button>
              ))}
            </div>

            {/* timeline */}
            <div className="flex-1 overflow-y-auto px-2 pb-3">
              {groups.map((group) => (
                <section key={group.label}>
                  <h5 className="sticky top-0 z-10 flex items-center gap-2 bg-white/95 px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-[#2F8F7A] backdrop-blur">
                    <ClockIcon className="h-3 w-3" />
                    {group.label}
                    <span className="h-px flex-1 bg-[#1B5E4F]/10" />
                  </h5>

                  <ul className="divide-y divide-[#1B5E4F]/5">
                    {group.items.map((person) => {
                      const isAnonymous = !person.user_id
                      const number = anonymousNumber.get(person)

                      const rowClass =
                        'group/row flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[#F1F6F4]'

                      // The same row content is used for both kinds of people
                      const content = (
                        <>
                          <span className="relative">
                            {isAnonymous ? (
                              <span
                                className={`grid h-11 w-11 place-items-center rounded-full ${ANON_TINTS[(number - 1) % ANON_TINTS.length]}`}
                              >
                                <UserIcon className="h-5 w-5" />
                              </span>
                            ) : (
                              <PersonAvatar person={person} size="h-11 w-11" text="text-sm" />
                            )}
                            <span
                              className={`absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full text-white ring-2 ring-white ${
                                person.reaction === 'like' ? 'bg-[#1B5E4F]' : 'bg-gray-500'
                              }`}
                            >
                              {person.reaction === 'like' ? (
                                <ThumbsUpIcon className="h-2.5 w-2.5" filled />
                              ) : (
                                <ThumbsDownIcon className="h-2.5 w-2.5" filled />
                              )}
                            </span>
                          </span>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`flex items-center gap-2 truncate font-semibold text-[#0D3A31] ${
                                isAnonymous ? '' : 'group-hover/row:text-[#1B5E4F] group-hover/row:underline'
                              }`}
                            >
                              {isAnonymous ? `Anonymous visitor #${number}` : fullName(person)}
                              {user?.id === person.user_id && (
                                <span className="rounded-full bg-[#E6F1EE] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#1B5E4F] no-underline">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {person.reaction === 'like' ? 'Liked this article' : 'Disliked this article'}
                              {isAnonymous && ' · Not signed in'}
                            </p>
                          </div>

                          {/* when they reacted */}
                          <div
                            className="shrink-0 text-right"
                            title={exactTime(person.created_at)}
                          >
                            <p className="text-xs font-medium text-[#1B5E4F]">
                              {timeAgo(person.created_at, now)}
                            </p>
                            <p className="mt-0.5 text-[11px] text-gray-400">
                              {clockTime(person.created_at)}
                            </p>
                          </div>

                          {/* arrow shows only on rows that open a profile */}
                          {!isAnonymous && (
                            <ChevronRightIcon className="h-4 w-4 shrink-0 -translate-x-1 text-[#2F8F7A] opacity-0 transition-all duration-200 group-hover/row:translate-x-0 group-hover/row:opacity-100" />
                          )}
                        </>
                      )

                      return (
                        <li key={person.user_id ?? `anon-${number}`}>
                          {isAnonymous ? (
                            <div className={rowClass}>{content}</div>
                          ) : (
                            <Link
                              to={`/authors/${person.user_id}`}
                              onClick={() => setShowPeople(false)}
                              title={`View ${fullName(person)}'s profile`}
                              className={`${rowClass} cursor-pointer`}
                            >
                              {content}
                            </Link>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}

              {visibleReactors.length === 0 && (
                <p className="px-3 py-10 text-center text-sm text-gray-500">
                  Nobody here yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function adjustCounts(counts, from, to) {
  const next = { ...counts }
  if (from === 'like') next.likes -= 1
  if (from === 'dislike') next.dislikes -= 1
  if (to === 'like') next.likes += 1
  if (to === 'dislike') next.dislikes += 1
  return next
}

function BulbIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3Z" />
    </svg>
  )
}

function UsersIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.8.7 3 2.2 3 5.2" />
    </svg>
  )
}

function UserIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}

function ClockIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function ChevronRightIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

function CloseIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function ThumbsUpIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  )
}

function ThumbsDownIcon({ className, filled }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  )
}