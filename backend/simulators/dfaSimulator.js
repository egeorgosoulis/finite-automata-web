function simulateDFA(automaton, inputString) {
    const { states, transitions } = automaton;

    if (!states.find(s => s.isInitial)) {
        throw new Error("No initial state defined");
    }

    if (!states.some(s => s.isFinal)) {
        throw new Error("No final states defined in the automaton");
    }

    let currentState = states.find(s => s.isInitial);

    for (const symbol of inputString) {
        const transition = transitions.find(t =>
            t.from === currentState.id && t.symbol === symbol
        );
        if (!transition) return false;

        currentState = states.find(s => s.id === transition.to);
    }

    return currentState.isFinal;
}

module.exports = {
    simulateDFA
  };