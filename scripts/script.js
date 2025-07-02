const CORONA_API = "https://api.rootnet.in/covid19-in/stats/latest";
let totalCount;
const totalCountShow = document.getElementById("total-counter");
const deaths = document.getElementById('deaths');
const discharged = document.getElementById('discharged');

function animateCounter(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.innerText = Math.floor(progress * (end - start) + start).toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.innerText = end.toLocaleString();
    }
  };
  window.requestAnimationFrame(step);
}

async function coronaData() {
  try {
    let res = await fetch(CORONA_API);
    let data = await res.json();

    totalCount = data.data.summary.total;
    animateCounter(totalCountShow, 0, totalCount, 1500);

    // Animate deaths and discharged
    if (deaths && discharged) {
      animateCounter(deaths, 0, data.data.summary.deaths, 1500);
      animateCounter(discharged, 0, data.data.summary.discharged, 1500);
    }

    // Store statewise data for tooltip
    window.statewiseData = {};
    data.data.regional.forEach(state => {
      window.statewiseData[state.loc] = state;
    });
  } catch (error) {
    console.log(error.message);
  }
}

coronaData();

// Tooltip logic for state hover
const tooltip = document.getElementById('state-tooltip');
document.querySelectorAll('area[data-state]').forEach(area => {
  area.addEventListener('mousemove', function(e) {
    const stateName = this.getAttribute('data-state');
    const stateData = window.statewiseData ? window.statewiseData[stateName] : null;
    if (stateData) {
      tooltip.innerHTML = `<strong>${stateData.loc}</strong><br>Total: ${stateData.totalConfirmed.toLocaleString()}<br>Recovered: ${stateData.discharged.toLocaleString()}<br>Deaths: ${stateData.deaths.toLocaleString()}`;
    } else {
      tooltip.innerHTML = `<strong>${stateName}</strong><br>Data not found`;
    }
    tooltip.style.display = 'block';
    tooltip.style.left = (e.pageX - tooltip.offsetParent.getBoundingClientRect().left + 10) + 'px';
    tooltip.style.top = (e.pageY - tooltip.offsetParent.getBoundingClientRect().top - 30) + 'px';
  });
  area.addEventListener('mouseleave', function() {
    tooltip.style.display = 'none';
  });
});
