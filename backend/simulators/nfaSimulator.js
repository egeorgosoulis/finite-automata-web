function simulateNFA(automaton, inputString) {
    const { states, transitions } = automaton;

    if (!states.find(s => s.isInitial)) {
        throw new Error("No initial state defined");
    }

    if (!states.some(s => s.isFinal)) {
        throw new Error("No final states defined in the automaton");
    }

    //antikathistw to ε se keno giati to pianei san input
    inputString = inputString.replace(/ε/g, "");

    let currentStates = epsilonClosure(
        [states.find(s => s.isInitial).id],
        transitions
    );

    for (const symbol of inputString) {
        const nextStates = new Set();

        for (const stateId of currentStates) {
            const possibleTransitions = transitions.filter(t =>
                t.from === stateId && t.symbol === symbol
            );

            for (const t of possibleTransitions) {
                const reachable = epsilonClosure([t.to], transitions);
                reachable.forEach(s => nextStates.add(s));
            }
        }

        currentStates = Array.from(nextStates);
    }

    return currentStates.some(stateId =>
        states.find(s => s.id === stateId)?.isFinal
    );
}

function epsilonClosure(stateIds, transitions) {
    const closure = new Set(stateIds);
    const stack = [...stateIds];

    while (stack.length > 0) {
        const current = stack.pop();

        const epsilonTransitions = transitions.filter(t =>
            t.from === current && t.symbol === ""
        );

        for (const t of epsilonTransitions) {
            if (!closure.has(t.to)) {
                closure.add(t.to);
                stack.push(t.to);
            }
        }
    }

    return Array.from(closure);
}

module.exports = {
    simulateNFA
};
