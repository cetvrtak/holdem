var slots = [p1c1,p1c2,p2c1,p2c2,flop_1,flop_2,flop_3,turn,river];

var tableCnv = document.getElementById("table_img");
var tableCtx = tableCnv.getContext("2d");
var tableImg = new Image();
tableImg.src = "images/table_trimmed_rotated.png";
tableImg.onload = function() {
	tableCnv.width = tableImg.width;
	tableCnv.height = tableImg.height;
	tableCtx.drawImage(tableImg, 0, 0, tableCnv.width, tableCnv.height);
};

var it = deal();
document.getElementById('deal').addEventListener("click", function () {
	event.target.style.display = "none";
	it.next();
});

var bets = {};
var allBets = [];
var isInitialRoundOfBetting;
var dealer;
function *deal() {
	let smallBlind = getNextPlayer(dealer);
	let bigBlind = getNextPlayer(smallBlind);
	bets[smallBlind] = 5;
	bets[bigBlind] = 10;
	allBets = [bets[smallBlind], bets[bigBlind]];
	for (const p in players)
	{
		players[p].cash -= bets[p];
	}
	for (var slot of slots) {
		slot.card = pickNewCard();

		setTimeout(function() {
			displayCard(slot);

			if (slot.id != "p2c2" && slot.id != "flop_3" && slot.id != "turn" && slot.id != "river")
			{
				it.next();
			}
			else {
				isInitialRoundOfBetting = true;
				placeBet(smallBlind);
			}
		}, 500);
		updateBets();
		yield;
	};
};

function clearTable() {
	for (var slot of slots) {
		document.getElementById(slot.id).textContent = "";
		slot.card = [];
	}
}

function isCardDealt(newCard) {
	for (const slot of slots)
	{
		if (slot.card && slot.card[0] == newCard[0] && slot.card[1] == newCard[1])
		{
			return true;
		}
	}
	return false;
}

function pickNewCard() {
	var newCard = [randomRank(), randomSuit()];
	if (isCardDealt(newCard))
	{
		newCard = pickNewCard();
	}
	return newCard;
}

var ranks = ["ace","king","queen","jack","10","9","8","7","6","5","4","3","2"];
function randomRank() {
	return ranks[Math.floor(Math.random() * ranks.length)];
};

function randomSuit() {
	var suits = ["hearts","spades","diamonds","clubs"];
	return suits[Math.floor(Math.random() * suits.length)];
};

var playerLogging;
function sit(evt) {
	document.getElementById("buyin").value = 1000;
	playerLogging = evt.target.id;
	var login = document.getElementById("login");
	login.style.display = "block";
}

document.getElementsByClassName("close")[0].addEventListener("click", function() {
	closeLogin();
	document.getElementById("main_menu").style.display = "block";
})

function closeLogin() {
	document.getElementById("login").style.display = "none";
}

var players = {};
function login() {
	let player = {
		username: document.getElementById("username").value,
		cash: +document.getElementById("buyin").value
	}
	players[playerLogging] = player;
	if (!dealer)
	{
		dealer = playerLogging;
	}

	document.getElementById(playerLogging).style.display = "none";
	closeLogin();

	if (singlePlayer)
	{
		players["p1"].human = true;
		players["p2"] = { username: "john_doe", cash: player.cash };
	}

	updatePlayers();
}

function updatePlayers() {
	for (const player in players) {
		let username = document.getElementById(player + "_username");
		username.textContent = players[player].username;
		username.style.display = "block";

		document.getElementById(player + "_cash").textContent = "$" + players[player].cash;

		placeChips(player, players[player].cash);
		if (Object.keys(players).length > 1)
		{
			document.getElementById("deal").style.display = "block";
		}
	}
}

function placeChips(player, amount) {
	let canvas = document.getElementById(player + "_stack");
	let ctx = canvas.getContext("2d");
	let img = new Image();
	img.src = "images/chipstacks/medium_t.png";

	img.onload = function() {
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	}
}

function updateBets() {
	for (const p in players)
	{
		let bet = bets[p] != 0 ? "$" + bets[p] : "";
		document.getElementById(p + "_bet").textContent = bet;
		document.getElementById(p + "_cash").textContent = players[p].cash;
	}
	document.getElementById("pot").textContent = "Pot: $" + allBets.reduce((sum, a) => sum + a, 0);
}

document.getElementById("p1_betAmount").addEventListener("change", function() {
	updateActionButton("p1");
});
document.getElementById("p2_betAmount").addEventListener("change", function() {
	updateActionButton("p2");
});
function placeBet(p) {
	if (!players[p].human)
	{
		document.getElementById(p + "_betAmount").value = aiBet(p);
		setTimeout(function() {
			submitBet(p);
		}, 1000);
		return;
	}
	document.getElementById(p + "_betPopup").style.display = "block";
	document.getElementById(p + "_betAmount").value = Math.abs(bets[p] - getMaxBet());
	document.getElementById(p + "_betAmount").min = Math.abs(bets[p] - getMaxBet());
	updateActionButton(p);
}

document.getElementById("p1_action").addEventListener("click", function() {
	submitBet("p1")
});
document.getElementById("p2_action").addEventListener("click", function() {
	submitBet("p2")
});
function submitBet(p) {
	let betAmount = +document.getElementById(p + "_betAmount").value;
	bets[p] += betAmount;
	players[p].cash -= betAmount;
	allBets.push(betAmount);
	updateBets();
	document.getElementById(p + "_betPopup").style.display = "none";

	let next = getNextPlayer(p);
	if (bets[next] != getMaxBet() || isInitialRoundOfBetting)
	{
		placeBet(next);
		isInitialRoundOfBetting = false;
	}
	else if (!document.getElementById("river").firstChild)
	{
		clearBets();
		it.next();
	}
	else
	{
		showAllCards();
		declareWinner();
		dealer = getNextPlayer(dealer);
	}
}

function updateActionButton(p) {
	let betAmount = document.getElementById(p + "_betAmount").value;
	var actionType = document.getElementById(p + "_action");
	if (betAmount == 0)
	{
		actionType.textContent = "Check";
	}
	else if (betAmount == Math.abs(bets[p] - getMaxBet()))
	{
		actionType.textContent = "Call";
	}
	else
	{
		actionType.textContent = "Raise";
	}
}

var handsRanking = {5: "High Card",
		7: "One Pair",
		9: "Two Pair",
		11: "Three Of A Kind",
		12: "Straight",
		12.5: "Flush",
		13: "Full House",
		17: "Four Of A Kind",
		18: "Straight Flush",
		19: "Royal Flush"};

function determineWinner() {
	let winner = ["p1", 0];
	for (const playerId in players)
	{
		let player = players[playerId];
		player.rankCount = {};

		for (const slot of slots)
		{
			const rank = slot.card[0];
			if (!players[slot.id.substring(0, 2)] || slot.id.substring(0, 2) == playerId)
			{
				player.rankCount[rank] != undefined ? player.rankCount[rank]++ : player.rankCount[rank] = 1;
			}
		}
		sortRanks(player);
		console.log(player.username, player.rankCount, player.sortedRanks);

		determineScore(player);
		if (player.score > winner[1])
		{
			winner = [playerId, player.score];
		}
		else if (player.score == winner[1] && player == breakTie(player, players[winner[0]]))
		{
			winner = [playerId, player.score];
		}
	}
	return winner;
}

function sortRanks(player)
{
	player.sortedRanks = [];
	for (const rank in player.rankCount)
	{
		player.sortedRanks.push([rank, player.rankCount[rank]]);
	}
	player.sortedRanks.sort(function(a, b) {
		return b[1] - a[1] || ranks.indexOf(a[0]) - ranks.indexOf(b[0]);
	});
}

function determineScore(player) {
	player.score = 0;
	let cardsCount = 0;
	let i = 0;
	while (cardsCount < 5)
	{
		player.score += Math.pow(player.sortedRanks[i][1], 2);
		cardsCount += player.sortedRanks[i][1];
		console.log(player.sortedRanks[i][1], cardsCount, player.score);
		i++;
	}
	// The rest (5 - cardsCount) can be:
	// 1: in case of 3x two pair or four of a kind + one pair or better
	// 2: in case of 2x three of a kind
	player.score += Math.pow(5 - cardsCount, 2);
	console.log("score:", player.score);
}

function declareWinner() {
	let winner = determineWinner();

	let popup = document.getElementById(winner[0] + "_winPopup");
	let pot = allBets.reduce((sum, a) => sum + a, 0);
	players[winner[0]].cash += pot;
	popup.textContent = handsRanking[winner[1]] + " You won $" + pot;
	popup.style.display = "block";

	setTimeout(function() {
		popup.style.display = "none";
		document.getElementById(winner[0] + "_cash").textContent = "$" + players[winner[0]].cash;
		clearTable();
		it = deal();
		it.next();
	}, 3000);
}

var singlePlayer;
document.getElementById("single_player").addEventListener("click", function() {
	singlePlayer = true;
	document.getElementById("players").style.display = "block";
	document.getElementById("main_menu").style.display = "none";

	// Automatically log players in
	var p1 = document.getElementById("p1");
	p1.click();
	p1.style.display = "none";
	document.getElementById("p2").style.display = "none";
});

document.getElementById("multi_player").addEventListener("click", function() {
	document.getElementById("players").style.display = "block";
	document.getElementById("main_menu").style.display = "none";
});

function getNextPlayer(p) {
	for (const player in players)
	{
		if (player > p) return player;
	}
	return "p1";
}

function getMaxBet() {
	let arr = Object.values(bets);
	return Math.max(...arr);
}

function clearBets() {
	for (const p in players)
	{
		bets[p] = 0;
	}
}

function showAllCards() {
	for (const slot of slots)
	{
		img = createCardImage(slot.card[0] + "_of_" + slot.card[1] + ".png");
		let slotNode = document.getElementById(slot.id);
		slotNode.replaceChild(img, slotNode.firstElementChild);
	}
}

function createCardImage(card) {
	let img = document.createElement("IMG");
	img.style.width = '31px';
	img.style.height = '44px';
	img.style.borderRadius = '2px';
	img.src = "images/deck/" + card;

	return img;
}

function displayCard(slot) {
	let card = slot.card[0] + "_of_" + slot.card[1] + ".png";
	let img;
	let currentPlayerId = slot.id.substring(0, 2);

	// show non-player and human player cards - TODO: show only THIS player's cards
	if (!players[currentPlayerId] || players[currentPlayerId].human)
	{
		img = createCardImage(card);
	}
	else
	{
		img = createCardImage("backside.png");
	}
	document.getElementById(slot.id).appendChild(img);
}

function aiBet(p) {
	return Math.abs(bets[p] - getMaxBet());
}

function breakTie(p1, p2) {
	for (var i = 0; p1.sortedRanks[i] && p2.sortedRanks[i]; i++)
	{
		if (ranks.indexOf(p1.sortedRanks[i][0]) == ranks.indexOf(p2.sortedRanks[i][0]))
		{
			continue;
		}
		var winner = ranks.indexOf(p1.sortedRanks[i][0]) < ranks.indexOf(p2.sortedRanks[i][0]) ? p1 : p2;
		console.log(winner.username, "wins a tie-break with ", winner.sortedRanks[i][0]);
		return winner;
	}
}