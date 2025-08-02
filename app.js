import { questions } from './questions.js';

const quizContainer = document.getElementById('quiz-container');
const resultsDiv = document.getElementById('results');
const submitBtn = document.getElementById('submit-btn');

// Render Questions
questions.forEach((q, idx) => {
  const qDiv = document.createElement('div');
  qDiv.classList.add('question');
  qDiv.innerHTML = `<b>Q${idx + 1}: ${q.question}</b>`;
  const optionsDiv = document.createElement('div');
  optionsDiv.classList.add('options');
  q.options.forEach((opt, optIdx) => {
    optionsDiv.innerHTML += `
      <label>
        <input type="radio" name="q${idx}" value="${optIdx}"/> ${opt}
      </label>`;
  });
  qDiv.appendChild(optionsDiv);
  quizContainer.appendChild(qDiv);
});

// Submission logic
submitBtn.onclick = () => {
  let score = 0;
  const review = [];
  const topicStats = {};
  questions.forEach((q, idx) => {
    const selected = document.querySelector(`input[name="q${idx}"]:checked`);
    const selectedIndex = selected ? parseInt(selected.value) : -1;
    const isCorrect = selectedIndex === q.answer;
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { correct: 0, incorrect: 0 };
    }
    if (isCorrect) {
      score++;
      topicStats[q.topic].correct++;
    } else {
      topicStats[q.topic].incorrect++;
    }
    review.push({
      idx: idx + 1,
      question: q.question,
      selected: selected ? q.options[selectedIndex] : "Not Answered",
      correct: q.options[q.answer],
      isCorrect,
      explanation: q.explanation,
      topic: q.topic
    });
  });
  
  // Show Results & Review
  resultsDiv.innerHTML = `<h2>Your Score: ${score} / ${questions.length}</h2>`;
  review.forEach(r => {
    resultsDiv.innerHTML += `
      <div class="${r.isCorrect ? 'correct' : 'incorrect'}">
        <b>Q${r.idx}:</b> ${r.question}<br>
        <b>Your Answer:</b> ${r.selected}<br>
        <b>Correct Answer:</b> ${r.correct}<br>
        <b>Explanation:</b> ${r.explanation}<br>
      </div><hr>`;
  });

  // Draw Charts
  showCharts(topicStats);
};

function showCharts(stats) {
  const topics = Object.keys(stats);
  const correct = topics.map(t => stats[t].correct);
  const incorrect = topics.map(t => stats[t].incorrect);

  // Destroy previous charts if re-submitted
  if (window.barChartInstance) window.barChartInstance.destroy();
  if (window.pieChartInstance) window.pieChartInstance.destroy();

  // Bar Chart
  const ctxBar = document.getElementById('barChart').getContext('2d');
  window.barChartInstance = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: topics,
      datasets: [
        { label: 'Correct', data: correct, backgroundColor: 'green' },
        { label: 'Incorrect', data: incorrect, backgroundColor: 'red' }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' }, title: { display: true, text: 'Performance by Topic' }}
    }
  });

  // Pie Chart (Overall Correct by Topic)
  const ctxPie = document.getElementById('pieChart').getContext('2d');
  window.pieChartInstance = new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: topics,
      datasets: [{
        data: correct,
        backgroundColor: ['green', 'orange', 'blue', 'purple', 'cyan', 'pink']
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: 'Correct Answers Distribution by Topic' }
      }
    }
  });
}
