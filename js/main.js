var rev_data = []

const liveData =
	"https://covid.ourworldindata.org/data/owid-covid-data.json";
const deadData = "js/data.json"

// Fetch JSON of countries to create a list of country to be sorted based on score
console.log("Loading data...");
$.getJSON(
	liveData,
	function(world) {

		for (country in world) {
			LOCATION = world[country].location;
			DATA = world[country].data;
			CUR_DATA = DATA[DATA.length - 1];

			// Skip Hong Kong to not break code sorry
			if (LOCATION == "Hong Kong") {
				continue
			}

			// Compute Score
			(world[country]).score = compute_score(CUR_DATA);
			SCORE = (world[country]).score;

			// Add countries to list for sorting
			new_data = {
				country: LOCATION,
				score: SCORE,
				stat: CUR_DATA,
				code: country
			};
			rev_data.push(new_data);

		}
		console.log("List created", rev_data);
		sort_score(rev_data);
		console.log(rev_data);
		setup();
	});


// Compute COVID SCORE
function compute_score(country_data) {
	infections = country_data.total_cases_per_million;
	deaths = country_data.total_deaths_per_million;
	new_deaths = country_data.new_deaths;
	new_cases = country_data.new_cases;


	// 2 million is the max score implying 0 deaths and 0 infections
	score = 2000000 - infections - deaths;
	// score = 2000000 - new_deaths - new_cases;


	// console.log(infections, deaths, score)

	return score
}

// Sorts country and rank them based on COVID score
function sort_score(rev_data) {
	rev_data.sort((a, b) => (a.score > b.score) ? -1 : 1)
	console.log("list sorted");
}


// HTML TEMPLATES
const data_header =
	`
	<div id="data_header" class="data-table w-row">
        <div class="w-col w-col-5 w-col-small-5 w-col-tiny-5">
          <h5 class="data-guide">Country Ranking</h5>
        </div>
        <div class="col2 w-col w-col-1 w-col-small-1 w-col-tiny-1"></div>
        <div class="w-col w-col-2 w-col-small-2 w-col-tiny-2">
          <h5 class="data-guide">Infections Per Million</h5>
        </div>
        <div class="w-col w-col-1 w-col-small-1 w-col-tiny-1"></div>
        <div class="w-col w-col-2 w-col-small-2 w-col-tiny-2">
          <h5 class="data-guide">Deaths Per Million</h5>
        </div>
        <div class="w-col w-col-1 w-col-small-1 w-col-tiny-1"></div>
      </div>
	`

const data_row =
	`
      <!-- Data Row (Odd) Sample -->
      <div id="|COUNTRY|" class="data_row w-row |ODD|">
        <div class="w-col w-col-5 w-col-small-5 w-col-tiny-5">
          <h2>|RANKING| – |FLAG| |COUNTRY|</h2>
        </div>
        <div class="col2 w-col w-col-1 w-col-small-1 w-col-tiny-1"></div>
        <div class="w-col w-col-2 w-col-small-2 w-col-tiny-2">
          <h2>|INFECTION|</h2>
        </div>
        <div class="w-col w-col-1 w-col-small-1 w-col-tiny-1"></div>
        <div class="w-col w-col-2 w-col-small-2 w-col-tiny-2">
          <h2>|DEATH|</h2>
        </div>
        <div class="w-col w-col-1 w-col-small-1 w-col-tiny-1"></div>
      </div>
      `


// Setup
// Generate rwos based on countries ranking
function setup() {
	$(document).ready(function() {
		$("#rank_container").html(generate_vis());
		console.log("setup is ran");
	});

	// Scroll
	attach_search();
}


function generate_vis() {
	// Add Header
	all = data_header
	rank = 0;
	// Add body
	for (i in rev_data) {
		rank += 1;
		row = data_row;
		// Replace placeholder with actual data
		row = row.replace("|RANKING|", rank);
		row = row.replace("|COUNTRY|", kill_space(rev_data[i].country));
		row = row.replace("|COUNTRY|", rev_data[i].country);
		row = row.replace("|INFECTION|", Math.round((rev_data[i].stat).total_cases_per_million)
			.toLocaleString());
		row = row.replace("|DEATH|", Math.round((rev_data[i].stat).total_deaths_per_million *
			100) / 100);
		row = row.replace("|FLAG|", getFlag(rev_data[i].code));


		// Create Stripe
		if (rank % 2 != 0) {
			row = row.replace("|ODD|", "data_odd");
		} else {
			row = row.replace("|ODD|", "");
		}


		all += row;
	}
	return all;
}


function kill_space(str) {
	str = str.replace(/ /g, "_");
	return str
}

function add_space(str) {
	str = str.replace(/_/g, " ");
	return str
}

// Find and highlight search input
function find() {
	query = document.getElementById("search_box").value;
	query = common_alias(query);
	query = kill_space(query);
	// Highlight and Scroll
	$("#" + query).css("background-color", "yellow");
	$('html, body').animate({
		scrollTop: $("#" + query).offset().top
	}, 2000);
}

// Attach event listener for quick search
function attach_search() {
	// Press Search
	$("#search_button").click(function() {
		find();
	});
	// Press enter
	$(document).on('keypress', function(e) {
		if (e.which == 13) {
			find();
		}
	});
}


function common_alias(query) {
	if (query == "USA") {
		query = "United States of America"
	};
	if (query == "USA") {
		query = "United States"
	};
	if (query == "US") {
		query = "United States"
	};
	if (query == "United State") {
		query = "United States"
	};
	return query;
}