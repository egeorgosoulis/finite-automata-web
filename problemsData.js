// dfa kai nfa accepted/rejected test cases gia ta problem cards tou learning section
const problemBank = {
  // Construct a DFA that recognises numbers in the decimal system which are multiples of 5.
  "dfa-easy-1": {
    id: "dfa-easy-1",
    title: "Multiples of 5",
    alphabet: "{0,1,2,3,4,5,6,7,8,9}",
    testCases: [
      { input: "1", expected: false },
      { input: "2", expected: false },
      { input: "3", expected: false },
      { input: "4", expected: false },
      { input: "0", expected: true },
      { input: "5", expected: true },
      { input: "10", expected: true },
      { input: "15", expected: true },
      { input: "20", expected: true },
      { input: "25", expected: true },
    ],
  },
  // Construct a DFA that recognises strings over the alphabet {a,b} which end with "ab".
  "dfa-easy-2": {
    id: "dfa-easy-2",
    title: 'Ending with "ab"',
    alphabet: "{a,b}",
    testCases: [
      { input: "a", expected: false },
      { input: "b", expected: false },
      { input: "ab", expected: true },
      { input: "aab", expected: true },
      { input: "bab", expected: true },
      { input: "aba", expected: false },
      { input: "abba", expected: false },
    ],
  },
  // Construct a DFA that recognises strings over the alphabet {a,b} which start with "aa."
  "dfa-easy-3": {
    id: "dfa-easy-3",
    title: 'Starting with "aa"',
    alphabet: "{a,b}",
    testCases: [
      { input: "a", expected: false },
      { input: "aa", expected: true },
      { input: "aaa", expected: true },
      { input: "aab", expected: true },
      { input: "ab", expected: false },
      { input: "baaa", expected: false },
    ],
  },
  // Construct a DFA that accepts binary strings with an even number of 0s and an even number of 1s.
  "dfa-medium-1": {
    id: "dfa-medium-1",
    title: "Even Number of 0s and 1s",
    alphabet: "{0,1}",
    testCases: [
      { input: "0", expected: false },
      { input: "1", expected: false },
      { input: "00", expected: true },
      { input: "01", expected: false },
      { input: "10", expected: false },
      { input: "11", expected: true },
    ],
  },
  // Construct a DFA that accepts binary strings where no two 1s appear consecutively.
  "dfa-medium-2": {
    id: "dfa-medium-2",
    title: "No Consecutive 1s",
    alphabet: "{0,1}",
    testCases: [
      { input: "0", expected: true },
      { input: "1", expected: true },
      { input: "10", expected: true },
      { input: "1010", expected: true },
      { input: "11", expected: false },
      { input: "011", expected: false },
      { input: "110", expected: false },
    ],
  },
  // Construct a DFA that accepts binary strings containing "101" as a substring.
  "dfa-medium-3": {
    id: "dfa-medium-3",
    title: 'Contains Substring "101"',
    alphabet: "{0,1}",
    testCases: [
      { input: "0", expected: false },
      { input: "1", expected: false },
      { input: "101", expected: true },
      { input: "0101", expected: true },
      { input: "1010", expected: true },
      { input: "1001", expected: false },
      { input: "1011", expected: true },
      { input: "1101", expected: true },
    ],
  },
  // Construct a DFA that recognises numbers divisible by 3 in the binary system.
  "dfa-hard-1": {
    id: "dfa-hard-1",
    title: "Divisible by 3 (Binary)",
    alphabet: "{0,1}",
    testCases: [
      { input: "0", expected: true },
      { input: "1", expected: false },
      { input: "000", expected: true },
      { input: "001", expected: false },
      { input: "010", expected: false },
      { input: "011", expected: true },
      { input: "100", expected: false },
      { input: "101", expected: true },
      { input: "110", expected: true },
      { input: "111", expected: false },
    ],
  },
  // Construct a DFA that accepts strings where the number of "01" substrings equals the number of "10" substrings.
  "dfa-hard-2": {
    id: "dfa-hard-2",
    title: 'Equal Number of "01" and "10" Substrings',
    alphabet: "{0,1}",
    testCases: [
      { input: "", expected: true },
      { input: "0", expected: true }, // 0 fores ara true
      { input: "1", expected: true },
      { input: "10", expected: false },
      { input: "1010", expected: false },
      { input: "11", expected: false },
      { input: "011", expected: false },
      { input: "110", expected: false },
      { input: "0110", expected: true },
      { input: "1001", expected: true },
      { input: "101", expected: true }, //epitrepetai h epikalupsh
    ],
  },
  // Construct a DFA that accepts strings where the third symbol from the end is "a".
  "dfa-hard-3": {
    id: "dfa-hard-3",
    title: 'Third Symbol from end is "a"',
    alphabet: "{a,b}",
    testCases: [
      { input: "", expected: false },
      { input: "ab", expected: false },
      { input: "b", expected: false },
      { input: "aba", expected: true },
      { input: "aabb", expected: true },
      { input: "bab", expected: false },
      { input: "baba", expected: true },
      { input: "abba", expected: false },
    ],
  },
  // Construct an NFA that accepts strings containing "aaa" or "bbb" as a substring.
  "nfa-easy-1": {
    id: "nfa-easy-1",
    title: 'Contains "aaa" or "bbb"',
    alphabet: "{a,b}",
    testCases: [
      { input: "", expected: false },
      { input: "a", expected: false },
      { input: "b", expected: false },
      { input: "aaa", expected: true },
      { input: "bbb", expected: true },
      { input: "baaab", expected: true },
      { input: "abab", expected: false },
      { input: "abbab", expected: false },
      { input: "baaabb", expected: true },
      { input: "aabbba", expected: true },
    ],
  },
  // Construct an NFA that accepts strings in the binary system ending with "00" or "11".
  "nfa-easy-2": {
    id: "nfa-easy-2",
    title: 'Strings ending with "00" or "11"',
    alphabet: "{0,1}",
    testCases: [
      { input: "", expected: false },
      { input: "0", expected: false },
      { input: "1", expected: false },
      { input: "00", expected: true },
      { input: "11", expected: true },
      { input: "01", expected: false },
      { input: "10", expected: false },
      { input: "011", expected: true },
      { input: "100", expected: true },
    ],
  },
  // Construct an NFA that accepts strings starting and ending with the same symbol.
  "nfa-easy-3": {
    id: "nfa-easy-3",
    title: "Starts and Ends with the Same Symbol",
    alphabet: "{a,b}",
    testCases: [
      { input: "", expected: false },
      { input: "a", expected: true },
      { input: "b", expected: true },
      { input: "aa", expected: true },
      { input: "aba", expected: true },
      { input: "aab", expected: false },
      { input: "ab", expected: false },
      { input: "baaa", expected: false },
    ],
  },
  // Construct an NFA that accepts strings of the symbol "a" length divisible by 2 or 3.
  "nfa-medium-1": {
    id: "nfa-medium-1",
    title: "Length Divisible by 2 or 3",
    alphabet: "{a}",
    testCases: [
      { input: "", expected: false },
      { input: "a", expected: false },
      { input: "aa", expected: true },
      { input: "aaa", expected: true },
      { input: "aaaa", expected: true },
      { input: "aaaaa", expected: false },
      { input: "aaaaaaaa", expected: true },
    ],
  },
  // Construct an NFA that accepts strings containing "ab" or "ba" as a substring.
  "nfa-medium-2": {
    id: "nfa-medium-2",
    title: 'Contains "ab" or "ba"',
    alphabet: "{a,b}",
    testCases: [
      { input: "", expected: false },
      { input: "a", expected: false },
      { input: "b", expected: false },
      { input: "ab", expected: true },
      { input: "ba", expected: true },
      { input: "aab", expected: true },
      { input: "bba", expected: true },
      { input: "abaa", expected: true },
      { input: "aaaa", expected: false },
      { input: "bbbb", expected: false },
      { input: "bbaba", expected: true },
    ],
  },
  // Construct an NFA that accepts binary strings where the second symbol is "1"
  "nfa-medium-3": {
    id: "nfa-medium-3",
    title: 'Second Symbol is "1"',
    alphabet: "{0,1}",
    testCases: [
      { input: "", expected: false },
      { input: "0", expected: false },
      { input: "1", expected: false },
      { input: "0101", expected: true },
      { input: "1101", expected: true },
      { input: "1010", expected: false },
      { input: "1001", expected: false },
      { input: "01010", expected: true },
    ],
  },
  // Construct an NFA that accepts strings in the binary system, containing "010" but not "101"
  "nfa-hard-1": {
    id: "nfa-hard-1",
    title: 'Contains "010" but Not "101"',
    alphabet: "{0,1}",
    testCases: [{ input: "", expected: false }],
  },
  // Construct an NFA accepting strings where the 5th symbol from the end is "a".
  "nfa-hard-2": {
    id: "nfa-hard-2",
    title: 'All strings where the 5th Symbol from the End is "a"',
    alphabet: "{a,b}",
    testCases: [{ input: "", expected: false }],
  },
  // Construct an NFA that accepts strings with an even number of 0s and/or an odd number of 1s.
  "nfa-hard-3": {
    id: "nfa-hard-3",
    title: "Even 0s or Odd 1s (or Both)",
    alphabet: "{0,1}",
    testCases: [{ input: "", expected: false }],
  },
};
