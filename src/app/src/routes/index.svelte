<script lang="ts">
	import _, { some, sum } from 'lodash';
	import { beforeUpdate, onMount } from 'svelte';

	import { fly, fade, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { defaultGinRummy } from './../rules/ginRummy';
	let loaded = false;
	let players: { name: string }[] = [];
	const roundLength = 12;
	let score: { [key: string]: Array<number> } = {};
	let scoreHistory = {};
	let giver = [];
	let currentRound = 0;

	function getFilledArray(length: number, val = 0): Array<number> {
		let out = [];
		for (let i = 0; i < length; i++) {
			out.push(val);
		}
		return out;
	}

	function handleFocus(ev: FocusEvent) {
		if (ev.target['textContent'] == 0) {
			ev.target['textContent'] = '';
		}
	}

	function handleKeyPress(ev: KeyboardEvent) {
		if (ev['key'] == 'Enter') (ev.target as HTMLElement).blur();
	}

	function handleBlur(ev: Event) {
		const [player, round] = ev.target['id'].split('.');
		if (ev.target['textContent'] == '') {
			score[player][round] = 0;
			ev.target['textContent'] = 0;
		}

		ev.target['textContent'] = (ev.target['textContent'] as string).trim();

		if (ev.target['textContent'] != 0) {
			score[player][round] = Math.round(parseInt(ev.target['textContent']) / 5) * 5;
			ev.target['textContent'] = score[player][round];
		}

		if (ev.target['textContent'].length > 1) {
			if (ev.target['textContent'][0] == '0')
				score[player][round] = parseInt(ev.target['textContent'].substr(1));
		}

		//Save score and players to localstorage
		saveGame();
		updateScoreHistory();
	}

	function saveGame() {
		window.localStorage.setItem('ginRummyScore', JSON.stringify(score));
		window.localStorage.setItem('ginRummyPlayers', JSON.stringify(players));
	}

	function addPlayer(ev: Event) {
		ev.preventDefault();
		let name = (document.getElementById('addPLayerName1') as HTMLInputElement).value;

		//check if name is unique
		if (players.find((player) => player.name == name)) {
			alert('Name must be unique');
			return;
		}
		players = [...players, { name: name }];
		saveGame();
		getDealer();
		(document.getElementById('addPLayerName1') as HTMLInputElement).value = '';
	}

	function clearGame() {
		window.localStorage.removeItem('ginRummyScore');
		window.localStorage.removeItem('ginRummyPlayers');
		window.location.reload();
		getDealer();
	}

	function getDealer() {
		let i = 0;
		let out = [];
		while (out.length < roundLength && players.length > 0) {
			out.push(players[i % players.length].name.substr(0, 2));
			i++;
		}
		if (out.length > 0) giver = out;
	}

	function updateScoreHistory() {
		for (let i = 0; i < roundLength; i++) {
			for (let player of players) {
				let playerSum = 0;
				for (let it = 0; it <= i; it++) {
					playerSum += score[player.name][it];
				}
				scoreHistory[player.name][i] = playerSum;
			}
		}
	}

	onMount(() => {
		if (window.localStorage.getItem('ginRummyScore'))
			score = JSON.parse(window.localStorage.getItem('ginRummyScore'));
		if (window.localStorage.getItem('ginRummyPlayers'))
			players = JSON.parse(window.localStorage.getItem('ginRummyPlayers'));
		getDealer();
	});

	beforeUpdate(() => {
		//Check so all players are in all data
		for (let player of players) {
			if (!_.has(scoreHistory, player.name)) {
				scoreHistory[player.name] = getFilledArray(roundLength);
			}
			if (!_.has(score, player.name)) {
				score[player.name] = getFilledArray(roundLength);
			}
		}
		if (!loaded) {
			loaded = !loaded;
		}

		//Update score history

		updateScoreHistory();
		currentRound = 12;
		for (let i = roundLength; i >= 0; i--) {
			let isChanged = false;
			for (let player of players) {
				if (score[player.name][i] != 0) isChanged = true;
			}
			if (!isChanged) currentRound = i;
		}
	});
</script>

<main class="container">
	<nav class="navbar fixed-bottom navbar-expand-sm navbar-dark bg-dark">
		<div class="container-fluid">
		  <span class="navbar-brand">Gin Rummy</span>
		  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
			<span class="navbar-toggler-icon"></span>
		  </button>
		  <div class="collapse navbar-collapse" id="navbarCollapse">
			<ul class="navbar-nav">
			  <li class="nav-item">
				<span class="nav-link active" aria-current="page" data-bs-toggle="modal" data-bs-target="#addPlayer">➕</span>
			  </li>
			  <li class="nav-item">
				<span class="nav-link" on:click={clearGame}>🗑</span>
			  </li>
			  <li class="nav-item dropup">
				<span class="nav-link dropdown-toggle" id="dropdown10" data-bs-toggle="dropdown" aria-expanded="false">Round</span>
				<ul class="dropdown-menu" aria-labelledby="dropdown10">
					{#each [_.get(defaultGinRummy, `ROUND_${currentRound}`, 'START')] as prev (_.get(defaultGinRummy, `ROUND_${currentRound}`, 'START'))}
					<li><span class="dropdown-item unactiveRound" in:slide={{ duration: 200, delay: 0 }}>{prev}</span></li>
					{/each}
					{#each [_.get(defaultGinRummy, `ROUND_${currentRound + 1}`, 'N/A')] as current (_.get(defaultGinRummy, `ROUND_${currentRound + 1}`, 'N/A'))}
					<li><span class="dropdown-item" in:slide={{ duration: 200, delay: 0 }}>{current}</span></li>
					{/each}
		
					{#each [_.get(defaultGinRummy, `ROUND_${currentRound + 2}`, 'END')] as next (_.get(defaultGinRummy, `ROUND_${currentRound + 2}`, 'END'))}
					<li>			<span class="unactiveRound dropdown-item" in:slide={{ duration: 200, delay: 0 }}>{next}</span>
					</li>			{/each}
				</ul>
			  </li>
			</ul>
		  </div>
		</div>
	  </nav>
	{#if loaded}
		<div class="table-responsive">
			<table class="table">
				<thead>
					<tr class="d-flex">
						<th class="col-1">#</th>
						{#each players as player}
							<td>{player.name}</td>
						{/each}
						<th class="col-1">👋</th>
					</tr>
				</thead>
				<tbody>
					{#each _.range(roundLength) as round}
						<tr class={currentRound > round ? 'table-secondary d-flex' : 'd-flex'}>
							<th class="col-1">{round + 1}</th>
							{#each players as player}
								<td>
									<span
										contenteditable="true"
										on:blur={handleBlur}
										on:focus={handleFocus}
										on:keydown={handleKeyPress}
										id={player.name + '.' + round}>{score[player.name][round]}</span
									>
									=
									<span>{_.get(scoreHistory, `${player.name}.${round}`, 'N/A')}</span>
								</td>
							{/each}
							<th class="col-1">{giver[round] || ''}</th>
						</tr>
					{/each}

					<tr class="d-flex">
						<th class="col-1">=</th>
						{#each players as player}
							<td>{_.sum(score[player.name])}</td>
						{/each}
						<th class="col-1" />
					</tr>
				</tbody>
			</table>
		</div>
		<div class="roundHolder">
		
		</div>
	{/if}

	<!-- Modal -->
	<div
		class="modal fade"
		id="addPlayer"
		tabindex="-1"
		aria-labelledby="addPlayerLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="addPlayerLabel">Add Player</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
				</div>
				<div class="modal-body">
					<form on:submit={addPlayer}>
						<div class="mb-3">
							<label for="addPLayerName1" class="form-label">Player name</label>
							<input
								type="text"
								class="form-control"
								id="addPLayerName1"
								aria-describedby="addPLayerName1"
							/>
						</div>
						<input
							data-bs-dismiss="modal"
							type="submit"
							class="btn btn-primary"
							value="Add Player"
						/>
					</form>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	.unactiveRound {
		font-size: small;
		color: lightgrey;
	}

	.table-secondary {
		opacity: 0.6;
	}

	.roundHolder {
		display: flex;
		justify-content: space-around;
		height: 2.5em;
	}

	td {
		width: 100%;
		min-width: 6em;
	}
</style>
