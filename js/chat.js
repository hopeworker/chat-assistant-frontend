(function () {
    'use strict'
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
      new bootstrap.Tooltip(tooltipTriggerEl)
    })
  })()

let newChatRequest = {
  model:"gpt-3.5-turbo",
  top_p:1,
  temperature:1.0,
  max_tokens:1024,
  frequency_penalty:0,
  presence_penalty:0,
};

const newChatButton = document.getElementById("new-chat");
const chatButton = document.getElementById("chat-button");
const userInput = document.getElementById("user-input");
const chatConversation = document.getElementById("chat-conversation");
const chatSessionsHistory = document.getElementById("chat-sessions-history");

function getSessionIdFromUrl() {
  const queryString = window.location.search;
  // Parse the query string and retrieve the 'sessionId' parameter
  const urlParams = new URLSearchParams(queryString);
  const sessionId = urlParams.get('sessionId');
  console.log("Get from URL, sessionId:", sessionId);
  return sessionId
}

function fixIncompleteCodeBlock(str) {
  const matches = str.match(/```/g);
  if (matches && matches.length % 2 !== 0) {
    str += "\n```"; // Append closing code block tag
  }
  return str;
}

function clearAllMessages() {
  chatConversation.innerHTML = '';
}

function clearAllChatSessionHistory() {
  chatSessionsHistory.innerHTML = '';
}

function appendUserMessage(text) {
  const messageContainer = document.createElement("div");
  messageContainer.className = "message-container";

  // add icon
  // const iconElement = document.createElement("div");
  // iconElement.className = "icon";
  // iconElement.classList.add("user-icon");
  // iconElement.textContent = "👤"; // User icon

  // add message
  const messageElement = document.createElement("div");
  messageElement.className = "message sent";
  messageElement.textContent = text;

  //
  // messageContainer.appendChild(iconElement);
  messageContainer.appendChild(messageElement);
  chatConversation.appendChild(messageContainer);

  // Scroll to the bottom of the conversation to show the latest message
  chatConversation.scrollTop = chatConversation.scrollHeight;
}

function appendResponseMessage(text) {
  const messageContainer = document.createElement("div");
  messageContainer.className = "message-container";

  // add icon
  // const iconElement = document.createElement("div");
  // iconElement.className = "icon";
  // iconElement.classList.add("robot-icon");
  // iconElement.textContent = "🤖"; // Robot icon

  // add message
  const messageElement = document.createElement("div");
  messageElement.className = "message received";

  //
  // messageContainer.appendChild(iconElement);
  messageContainer.appendChild(messageElement);
  chatConversation.appendChild(messageContainer);

  let result = fixIncompleteCodeBlock(text);
  // Render Markdown content
  messageElement.innerHTML = marked(result);
  // code highlight
  messageContainer.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightBlock(block);
  });

}

chatButton.addEventListener("click", function (e) {
  e.preventDefault();

  const userMessage = userInput.value;

  // Clear the input field after submitting
  userInput.value = "";

  // Append the user's message to the conversation
  appendUserMessage(userMessage);

  console.log("Before post /chat")

  fetch(`${backendURL}/api/chat`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({sessionId:sessionStorage.getItem("curSessionId"), prompt:userMessage}),
  })
    .then((response) => response.json())
    .then((data) => {
      appendResponseMessage(data.content);
    })
    .catch((error) => {
      console.error("Chat Error:", error);
    });
});

newChatButton.addEventListener("click", function(e) {
  e.preventDefault;
  console.log("new chat");

  fetch(`${backendURL}/api/chatSession`, {
      method: "POST",
      credentials: "include",
      headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
      body: JSON.stringify(newChatRequest)
  })
  .then(response => response.json())
  .then(data => {
          clearAllMessages();
          console.log("new chat response:", data);
          sessionStorage.setItem("curSessionId", data.id);
          userInput.focus();
        })
  .catch(e => console.error("New Chat Error:", e));

  
  setTimeout(() => {
    renderUserSessions();
    renderSessionMessages();    
  }, 500);

});


function appendChatSession(session) {
  const liElement = document.createElement("li");

  const linkElement = document.createElement("a");
  linkElement.className = "link-dark rounded";
  linkElement.textContent = session.description;
  linkElement.setAttribute("data-user-session-id", session.id)
  
  linkElement.addEventListener("click", function(e) {
    const curSessionId = linkElement.getAttribute('data-user-session-id');
    sessionStorage.setItem("curSessionId", curSessionId);
    console.log(`Session ${curSessionId} clicked.`)

    // render chat content
    renderSessionMessages(curSessionId)
  });

  liElement.appendChild(linkElement);
  chatSessionsHistory.appendChild(liElement);

}

function renderSessionMessages(sessionId) {
  if (!sessionId) return;

  fetch(`${backendURL}/api/chatSession/messages?sessionId=${encodeURIComponent(sessionId)}`,{
    method: "GET",
    credentials: "include",
    headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
  })
  .then(response => response.json())
  .then(data => {

      clearAllMessages();

      console.log(data);
      data.forEach(message => {
          if (message.role === 'user') {
              appendUserMessage(message.content)
          } else {
              appendResponseMessage(message.content)
          }

      });
      userInput.focus();

  })
  .catch(error => console.error("Error:", error));
}

function renderUserSessions() {
  
  fetch(`${backendURL}/api/chatSession`, {
    method: "GET",
    credentials: "include",
    headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
  })
  .then(response => response.json())
  .then(data => {

      clearAllChatSessionHistory();
      console.log(data);
      data.forEach(session => {
        appendChatSession(session);
      });
  })
  .catch(error => console.error("Error:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  let loginStatus = sessionStorage.getItem("loginStatus");
  if (loginStatus === "login") {

    fetch(`${backendURL}/api/chatSession`, {
      method: "GET",
      credentials: "include",
      headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
    })
    .then(response => response.json())
    .then(data => {
  
        clearAllChatSessionHistory();

        if (data.length === 0) {
          fetch(`${backendURL}/api/chatSession`, {
              method: "POST",
              credentials: "include",
              headers: {
                  "Content-Type": "application/json;charset=UTF-8",
                },
              body: JSON.stringify(newChatRequest)
          })
          .then(response => response.json())
          .then(data => {
                  clearAllMessages();
                  console.log("new chat response:", data);
                  sessionStorage.setItem("curSessionId", data.id);
                  userInput.focus();
                })
          .catch(e => console.error("New Chat Error:", e));
          
        } else {
          data.forEach(session => {
            appendChatSession(session);
          });
        }
    })
    .catch(error => console.error("Error:", error));

    setTimeout(() => {
      renderUserSessions();
      renderSessionMessages();    
    }, 500);

    userInput.focus();
  } else {
    window.location.href = "login.html"
  }
});