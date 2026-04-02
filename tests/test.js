document.addEventListener("DOMContentLoaded", () => {

    // Перемешивание вариантов ответов для всех вопросов
    document.querySelectorAll(".question-block").forEach(block => {
        const labels = Array.from(block.querySelectorAll("label"));
        for (let i = labels.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [labels[i], labels[j]] = [labels[j], labels[i]];
        }
        // Очищаем блок и вставляем перемешанные варианты
        block.innerHTML = `<p>${block.querySelector("p").innerHTML}</p>`;
        labels.forEach(label => block.appendChild(label));
    });

    // Проверка ответов (твой существующий код)
    const checkBtn = document.getElementById("check-test");
    const resultBlock = document.getElementById("test-result");
    const nextBtn = document.getElementById("next-btn");

    checkBtn.addEventListener("click", () => {
        let score = 0;
        let total = 0;

        document.querySelectorAll(".question-block").forEach(block => {
            total++;
            const answers = block.querySelectorAll("input[type='radio']");
            let userAnswer = block.querySelector("input[type='radio']:checked");
            let correctAnswer = [...answers].find(a => a.value === "1");

            // Подсветка правильного ответа
            correctAnswer.parentElement.classList.add("correct");

            if (userAnswer) {
                if (userAnswer.value === "1") {
                    score++;
                } else {
                    userAnswer.parentElement.classList.add("wrong");
                }
            }
        });

        resultBlock.textContent = `Вы набрали: ${score} из ${total}`;
        nextBtn.classList.remove("hidden");
    });

});