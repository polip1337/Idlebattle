export function initializeLibrary() {
    fetchLibraryData('Data/library.json');

    function fetchLibraryData(url) {
        fetch(url)
            .then(response => response.json())
            .then(data => populateLibraryContainer(data))
            .catch(error => console.error('Error fetching library data:', error));
    }

    function populateLibraryContainer(data) {
        const topicsContainer = document.getElementById('topics');
        topicsContainer.innerHTML = ''; // Clear existing topics
        data.topics.forEach(topic => createTopicElement(topic, topicsContainer));

        // Add click event listeners to all topic and subtopic elements
        const topicElements = topicsContainer.querySelectorAll('li[data-topic]');
        topicElements.forEach(element => {
            element.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent expandable toggle
                setActiveTopic(element, data);
            });
        });
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
            ul.style.display = 'none'; // Initially hide subtopics
            topic.subtopics.forEach(subtopic => createSubtopicElement(subtopic, ul));

            li.appendChild(ul);
            li.addEventListener('click', (e) => {
                if (e.target.tagName !== 'LI' || !e.target.dataset.topic) {
                    toggleSubtopics(li);
                }
            });
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
        if (subtopics) {
            const isExpanded = subtopics.style.display === 'block';
            subtopics.style.display = isExpanded ? 'none' : 'block';
            element.classList.toggle('expanded', !isExpanded);
        }
    }

    function setActiveTopic(element, data) {
        // Remove active class from all topics
        const allTopics = document.querySelectorAll('#topics li');
        allTopics.forEach(topic => topic.classList.remove('active'));

        // Set active class on clicked topic
        element.classList.add('active');

        // Expand parent topic if clicking a subtopic
        const parentExpandable = element.closest('.expandable');
        if (parentExpandable) {
            const subtopics = parentExpandable.querySelector('.subtopics');
            if (subtopics) {
                subtopics.style.display = 'block';
                parentExpandable.classList.add('expanded');
            }
        }

        // Find and display content immediately
        let topicData = data.topics.find(topic => topic['data-topic'] === element.dataset.topic);
        if (!topicData && data.topics.some(topic => topic.subtopics)) {
            for (const topic of data.topics) {
                if (topic.subtopics) {
                    topicData = topic.subtopics.find(subtopic => subtopic['data-topic'] === element.dataset.topic);
                    if (topicData) break;
                }
            }
        }

        const contentArea = document.getElementById('content');
        if (topicData && topicData.content) {
            contentArea.innerHTML = `
                <h2>${topicData.name}</h2>
                <p>${topicData.content}</p>
            `;
        } else {
            contentArea.innerHTML = `
                <h2>${element.textContent}</h2>
                <p>No content available.</p>
            `;
        }
    }
}

// Initialize library when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeLibrary);