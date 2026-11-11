// Short shouted supporter slogans shown, one at random, on the open-in-app page.
//
// Only a few words each, written here directly: no song lyrics, no wording copied from a wiki, and no
// supporter-group names or mottos (which would read as the group's endorsement). Korean only, on both
// language pages. Add an entry only after a person who follows the club confirms it is in common use.
export const slogans = [
  "우리에겐 승리뿐이다",
  "나의 수원",
  "수원 언제나 우린 너와 함께해",
  "수원 블루윙",
  "힘을 내라, 수원",
];

/** One slogan for a random number in [0, 1); injectable so tests do not depend on chance. */
export function pickSlogan(random = Math.random()) {
  const index = Math.min(slogans.length - 1, Math.max(0, Math.floor(random * slogans.length)));
  return slogans[index];
}
