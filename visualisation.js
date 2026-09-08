(() => {
	const STEP_DELAY = 650;
	let isRunning = false;
	let manualSession = null;
	let visualisationMode = null;
	let isPaused = false;
	let resumePlayback = null;

	function translate(key, replacements = {}) {
		let text = getTranslation(key);
		Object.entries(replacements).forEach(([name, value]) => {
			text = text.replace(`{${name}}`, value);
		});
		return text;
	}

	function wait(milliseconds) {
		return new Promise(resolve => {
			let remaining = milliseconds;
			let startedAt = Date.now();
			let timer;

			function tick() {
				if (isPaused) {
					resumePlayback = () => {
						resumePlayback = null;
						startedAt = Date.now();
						timer = setTimeout(tick, remaining);
					};
					return;
				}

				remaining -= Date.now() - startedAt;
				if (remaining <= 0) {
					resolve();
					return;
				}

				startedAt = Date.now();
				timer = setTimeout(tick, Math.min(50, remaining));
			}

			tick();
		});
	}

	function updateVisualisationControls() {
		const playButton = document.getElementById("visualisationPlayFA");
		const stopButton = document.getElementById("visualisationStopFA");
		const stepButton = document.getElementById("visualisationStepFA");

		playButton.disabled = visualisationMode === "manual";
		stopButton.disabled = visualisationMode !== "play" || isPaused;
		stepButton.disabled = visualisationMode === "play";
	}

	function getStateCircle(stateId) {
		return document.querySelector(`#svg-area circle[data-id="${CSS.escape(stateId)}"]`);
	}

	function getStateGroup(stateId) {
		return getStateCircle(stateId)?.closest("g.state");
	}

	function getTransitionPaths(from, to, symbol) {
		return [...document.querySelectorAll("#svg-area .transition")].filter(path => {
			if (path.getAttribute("data-from") !== from || path.getAttribute("data-to") !== to) {
				return false;
			}

			return path.getAttribute("data-symbol")
				.split(",")
				.map(value => value.trim() === "ε" ? "" : value.trim())
				.includes(symbol);
		});
	}

	function clearVisualisation() {
		document.querySelectorAll(
			"#svg-area .visualisation-active, #svg-area .visualisation-current, " +
			"#svg-area .visualisation-result, #svg-area .visualisation-rejected, " +
			"#svg-area .visualisation-transition"
		)
			.forEach(element => element.classList.remove(
				"visualisation-active",
				"visualisation-current",
				"visualisation-result",
				"visualisation-rejected",
				"visualisation-transition"
			));
	}

	function highlightStates(stateIds, className) {
		stateIds.forEach(stateId => {
			const circle = getStateCircle(stateId);
			if (circle) circle.classList.add(className);
		});
	}

	function highlightTransitions(transitions, symbol) {
		const paths = transitions.flatMap(transition =>
			getTransitionPaths(transition.from, transition.to, symbol)
		);
		paths.forEach(path => path.classList.add("visualisation-transition"));
		return paths;
	}

	function epsilonClosure(stateIds, transitions) {
		const closure = new Set(stateIds);
		const pending = [...stateIds];

		while (pending.length) {
			const stateId = pending.pop();
			transitions
				.filter(transition => transition.from === stateId && transition.symbol === "")
				.forEach(transition => {
					if (!closure.has(transition.to)) {
						closure.add(transition.to);
						pending.push(transition.to);
					}
				});
		}

		return [...closure];
	}

	async function showEpsilonClosure(stateIds, transitions) {
		const closure = epsilonClosure(stateIds, transitions);
		const epsilonTransitions = transitions.filter(transition =>
			stateIds.includes(transition.from) &&
			closure.includes(transition.to) &&
			transition.symbol === ""
		);

		if (epsilonTransitions.length) {
			highlightTransitions(epsilonTransitions, "");
			highlightStates(closure, "visualisation-active");
			await wait(STEP_DELAY);
		}

		return closure;
	}

	async function visualiseDfa(input, automaton, onProgress) {
		let currentState = automaton.states.find(state => state.isInitial)?.id;
		highlightStates([currentState], "visualisation-current");
		await wait(STEP_DELAY);

		const symbols = input.replace(/ε/g, "");
		for (const [index, symbol] of [...symbols].entries()) {
			onProgress(index, symbol, symbols.slice(0, index));
			const transition = automaton.transitions.find(candidate =>
				candidate.from === currentState && candidate.symbol === symbol
			);

			if (!transition) {
				return {
					accepted: false,
					finalStates: [currentState],
					reason: `No transition for '${symbol}' from ${currentState}`
				};
			}

			clearVisualisation();
			highlightStates([currentState], "visualisation-current");
			highlightTransitions([transition], symbol);
			await wait(STEP_DELAY);

			currentState = transition.to;
			clearVisualisation();
			highlightStates([currentState], "visualisation-current");
			await wait(STEP_DELAY);
		}

		const accepted = automaton.states.find(state => state.id === currentState)?.isFinal === true;
		return { accepted, finalStates: [currentState] };
	}

	async function visualiseNfa(input, automaton, onProgress) {
		let currentStates = epsilonClosure(
			[automaton.states.find(state => state.isInitial).id],
			automaton.transitions
		);

		highlightStates(currentStates, "visualisation-current");
		await wait(STEP_DELAY);

		const symbols = input.replace(/ε/g, "");
		for (const [index, symbol] of [...symbols].entries()) {
			onProgress(index, symbol, symbols.slice(0, index));
			const matchingTransitions = automaton.transitions.filter(transition =>
				currentStates.includes(transition.from) && transition.symbol === symbol
			);

			if (!matchingTransitions.length) {
				return { accepted: false, finalStates: currentStates, reason: `No transition for '${symbol}'` };
			}

			clearVisualisation();
			highlightStates(currentStates, "visualisation-current");
			highlightTransitions(matchingTransitions, symbol);
			await wait(STEP_DELAY);

			const nextStates = [...new Set(matchingTransitions.map(transition => transition.to))];
			currentStates = await showEpsilonClosure(nextStates, automaton.transitions);
			clearVisualisation();
			highlightStates(currentStates, "visualisation-current");
			await wait(STEP_DELAY);
		}

		const accepted = currentStates.some(stateId =>
			automaton.states.find(state => state.id === stateId)?.isFinal
		);
		return { accepted, finalStates: currentStates };
	}

	async function visualiseString(input, automaton, onProgress) {
		clearVisualisation();
		const result = automaton.type === "NFA"
			? await visualiseNfa(input, automaton, onProgress)
			: await visualiseDfa(input, automaton, onProgress);

		clearVisualisation();
		highlightStates(result.finalStates || [], result.accepted
			? "visualisation-result"
			: "visualisation-rejected");
		await wait(STEP_DELAY);
		return result;
	}

	function validateAutomaton(automaton) {
		if (!automaton.states.length) {
			return getTranslation("alertEmptyAutomaton");
		}
		if (!automaton.states.some(state => state.isInitial)) {
			return getTranslation("alertNoInitialState");
		}
		if (!automaton.states.some(state => state.isFinal)) {
			return getTranslation("alertNoFinalState");
		}
		return null;
	}

	function expandTransitions(automaton) {
		return {
			...automaton,
			transitions: automaton.transitions.flatMap(transition =>
				transition.symbol.split(",").map(symbol => ({
					...transition,
					symbol: symbol.trim() === "ε" ? "" : symbol.trim()
				}))
			)
		};
	}

	function renderVisualisationProgress(inputs, currentIndex, currentInput, consumed, symbol, results) {
		const testResults = document.getElementById("testResults");
		testResults.replaceChildren();

		const heading = document.createElement("p");
		heading.textContent = translate("visualisationProgress");
		testResults.appendChild(heading);

		const current = document.createElement("p");
		current.className = "visualisation-progress-current";
		current.append(translate("visualisationTestingString", {
			current: currentIndex + 1,
			total: inputs.length
		}));

		const displayInput = currentInput.replace(/ε/g, "");
		if (!displayInput) {
			const emptySymbol = document.createElement("span");
			emptySymbol.className = "visualisation-read-character";
			emptySymbol.textContent = "ε";
			current.appendChild(emptySymbol);
		} else {
			const consumedLength = [...consumed].length;
			[...displayInput].forEach((character, index) => {
				const characterElement = document.createElement("span");
				characterElement.className = index < consumedLength
					? "visualisation-read-character"
					: index === consumedLength && symbol
						? "visualisation-current-character"
						: "visualisation-unread-character";
				characterElement.textContent = character;
				current.appendChild(characterElement);
			});
		}
		testResults.appendChild(current);

		const step = document.createElement("p");
		step.className = "visualisation-progress-step";
		step.textContent = symbol
			? translate("visualisationReadStep", {
				consumed: consumed || "ε",
				symbol
			})
			: translate("visualisationPreparing");
		testResults.appendChild(step);

		if (results.length) {
			const completed = document.createElement("p");
			completed.textContent = translate("visualisationCompletedStrings");
			testResults.appendChild(completed);

			const list = document.createElement("ul");
			list.className = "results-list";
			results.forEach(result => {
				const item = document.createElement("li");
				item.className = `test-row ${result.accepted ? "accepted" : "rejected"}`;

				const input = document.createElement("span");
				input.className = "result-string";
				input.textContent = result.input || "ε";

				const arrow = document.createElement("span");
				arrow.className = "result-arrow";
				arrow.textContent = "→";

				const status = document.createElement("span");
				status.className = "result-status";
				status.textContent = result.accepted ? getTranslation("accepted") : getTranslation("rejected");

				item.append(input, arrow, status);
				list.appendChild(item);
			});
			testResults.appendChild(list);
		}
	}

	function createManualRunner(input, automaton, onProgress) {
		const symbols = [...input.replace(/ε/g, "")];
		let position = 0;
		let currentState;
		let currentStates;
		let started = false;

		function finish(finalStates) {
			const accepted = finalStates.some(stateId =>
				automaton.states.find(state => state.id === stateId)?.isFinal
			);
			clearVisualisation();
			highlightStates(finalStates, accepted
				? "visualisation-result"
				: "visualisation-rejected");
			return { done: true, accepted, finalStates };
		}

		function start() {
			started = true;
			if (automaton.type === "NFA") {
				currentStates = epsilonClosure(
					[automaton.states.find(state => state.isInitial).id],
					automaton.transitions
				);
				highlightStates(currentStates, "visualisation-current");
			} else {
				currentState = automaton.states.find(state => state.isInitial).id;
				highlightStates([currentState], "visualisation-current");
			}
			onProgress(0, null, "");
		}

		return {
			step() {
				if (!started) {
					start();
					if (!symbols.length) {
						return finish(automaton.type === "NFA" ? currentStates : [currentState]);
					}
					return { done: false };
				}

				if (position >= symbols.length) {
					return finish(automaton.type === "NFA" ? currentStates : [currentState]);
				}

				const symbol = symbols[position];
				onProgress(position, symbol, symbols.slice(0, position).join(""));
				clearVisualisation();

				if (automaton.type === "NFA") {
					const matchingTransitions = automaton.transitions.filter(transition =>
						currentStates.includes(transition.from) && transition.symbol === symbol
					);

					if (!matchingTransitions.length) {
						highlightStates(currentStates, "visualisation-rejected");
						return { done: true, accepted: false, finalStates: currentStates };
					}

					highlightStates(currentStates, "visualisation-current");
					highlightTransitions(matchingTransitions, symbol);
					const nextStates = [...new Set(matchingTransitions.map(transition => transition.to))];
					currentStates = epsilonClosure(nextStates, automaton.transitions);
					highlightStates(currentStates, "visualisation-active");
				} else {
					const transition = automaton.transitions.find(candidate =>
						candidate.from === currentState && candidate.symbol === symbol
					);

					if (!transition) {
						highlightStates([currentState], "visualisation-rejected");
						return { done: true, accepted: false, finalStates: [currentState] };
					}

					highlightStates([currentState], "visualisation-current");
					highlightTransitions([transition], symbol);
					currentState = transition.to;
					highlightStates([currentState], "visualisation-active");
				}

				position++;
				return { done: false };
			}
		};
	}

	function getInputs() {
		return document.getElementById("testStrings").value
			.split(",")
			.map(value => value.trim())
			.filter(value => value !== "");
	}

	function showFinalResults(results) {
		document.getElementById("testResults").innerHTML = `
			<p>${getTranslation("testResultsHeading")}</p>
			<ul class="results-list">
				${results.map(result => `
					<li class="test-row ${result.accepted ? "accepted" : "rejected"}">
						<span class="result-string">${result.input === "" ? "ε" : result.input}</span>
						<span class="result-arrow">→</span>
						<span class="result-status">${result.accepted ? getTranslation("accepted") : getTranslation("rejected")}</span>
					</li>
				`).join("")}
			</ul>
		`;
	}

	document.getElementById("visualisationPlayFA").addEventListener("click", async () => {
		if (isRunning) {
			if (visualisationMode === "play" && isPaused) {
				isPaused = false;
				resumePlayback?.();
				updateVisualisationControls();
			}
			return;
		}

		const inputs = getInputs();
		const automaton = expandTransitions(getAutomatonData());
		const validationError = validateAutomaton(automaton);

		if (validationError) {
			alert(validationError);
			return;
		}
		if (!inputs.length) {
			alert(getTranslation("acceptedStrings"));
			return;
		}

		isRunning = true;
		visualisationMode = "play";
		isPaused = false;
		updateVisualisationControls();

		try {
			const results = [];
			renderVisualisationProgress(inputs, 0, inputs[0], "", null, results);
			for (const [index, input] of inputs.entries()) {
				const result = await visualiseString(
					input,
					automaton,
					(stepIndex, symbol, consumed) => renderVisualisationProgress(
						inputs, index, input, consumed, symbol, results
					)
				);
				results.push({ input, ...result });
				renderVisualisationProgress(inputs, index, input, input.replace(/ε/g, ""), null, results);
			}

			showFinalResults(results);
		} finally {
			isRunning = false;
			visualisationMode = null;
			isPaused = false;
			resumePlayback = null;
			updateVisualisationControls();
			clearVisualisation();
		}
	});

	document.getElementById("visualisationStopFA").addEventListener("click", () => {
		if (visualisationMode !== "play" || !isRunning) return;
		isPaused = true;
		updateVisualisationControls();
	});

	document.getElementById("visualisationStepFA").addEventListener("click", () => {
		if (isRunning && !manualSession) return;

		if (!manualSession) {
			const inputs = getInputs();
			const automaton = expandTransitions(getAutomatonData());
			const validationError = validateAutomaton(automaton);

			if (validationError) {
				alert(validationError);
				return;
			}
			if (!inputs.length) {
				alert(getTranslation("acceptedStrings"));
				return;
			}

			manualSession = { inputs, automaton, index: 0, runner: null, results: [] };
			isRunning = true;
			visualisationMode = "manual";
			updateVisualisationControls();
		}

		const session = manualSession;
		if (!session.runner) {
			const input = session.inputs[session.index];
			session.runner = createManualRunner(
				input,
				session.automaton,
				(stepIndex, symbol, consumed) => renderVisualisationProgress(
					session.inputs, session.index, input, consumed, symbol, session.results
				)
			);
		}

		const result = session.runner.step();
		if (!result.done) return;

		session.results.push({ input: session.inputs[session.index], ...result });
		if (session.index < session.inputs.length - 1) {
			session.index++;
			session.runner = null;
			renderVisualisationProgress(
				session.inputs,
				session.index,
				session.inputs[session.index],
				"",
				null,
				session.results
			);
			return;
		}

		showFinalResults(session.results);
		manualSession = null;
		isRunning = false;
		visualisationMode = null;
		updateVisualisationControls();
	});

	updateVisualisationControls();
})();

