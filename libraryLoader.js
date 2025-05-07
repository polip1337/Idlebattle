document.addEventListener('DOMContentLoaded', function() {
    fetchLibraryData('Data/library.json');

        function fetchLibraryData(url) {
            fetch(url)
                .then(response => response.json())
                .then(data => populateLibraryContainer(data))
                .catch(error => console.error('Error fetching library data:', error));
        }

        function populateLibraryContainer(data) {
            const topicsContainer = document.getElementById('topics');
            data.topics.forEach(topic => createTopicElement(topic, topicsContainer));
        }

        function createTopicElement(topic, parentElement) {
            const li = document.createElement('li');

            if (topic.subtopics) {
                li.classList.add('expandable');
                const span = document.createElement('span');
                span.textContent = topic.name;
                li.appendChild(span);

                const ul = document.createElement('ul');
                ul.className = 'subtopics';
                ul.style.display = 'none';  // Initially hide the subtopics
                topic.subtopics.forEach(subtopic => createSubtopicElement(subtopic, ul));

                li.appendChild(ul);
                li.onclick = function() { toggleSubtopics(this) };
            } else {
                li.setAttribute('data-topic', topic['data-topic']);
                li.textContent = topic.name;
            }

            parentElement.appendChild(li);
        }

        function createSubtopicElement(subtopic, parentElement) {
            const subLi = document.createElement('li');
            subLi.setAttribute('data-topic', subtopic['data-topic']);
            subLi.textContent = subtopic.name;
            parentElement.appendChild(subLi);
        }

        function toggleSubtopics(element) {
            const subtopics = element.querySelector('.subtopics');
            if (subtopics.style.display === 'none' || !subtopics.style.display) {
                subtopics.style.display = 'block';
            } else {
                subtopics.style.display = 'none';
            }
        }
});