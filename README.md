## 🧼 Collaborative Whiteboard App

A real-time collaborative whiteboard built with **React**, **Fabric.js**, and **Socket.io**. Users can draw freely, undo/redo their actions, erase objects, and collaborate live with others.

[Demo] https://github.com/user-attachments/assets/b2e1bbb1-ab7b-4b99-88fc-e77f687d71d5
<video src="https://github.com/user-attachments/assets/b2e1bbb1-ab7b-4b99-88fc-e77f687d71d5"></video>

---




### 🚀 Features

* 🔊 Freehand Drawing with Pencil Tool
* 🔄 Undo and Redo Functionality
* ❌ Erase Individual Objects by Clicking
* 🌐 Real-Time Collaboration with Socket.io
* 📱 Fully Responsive Canvas

---

### 🛠️ Tech Stack

* **Frontend**: React, TypeScript, Fabric.js
* **Realtime**: Socket.io
* **Styling**: Bootstrap / Tailwind (Optional)

---

### 📦 Installation

```bash
git clone https://github.com/prathamesh-kothalkar/realtime-whiteboard.git
cd realtime-whiteboard
```

---

### ▶️ Running the App

#### Start Server (Socket.io):

```bash
cd backend
npm install
npm run dev
```

#### Start Client:

```bash
cd frontend
npm run dev
```
#### Start Keycloak:
```bash
cd keycloak
docker-compose up
```

Make sure the frontend is connecting to the correct WebSocket server (`localhost:PORT`).

---

### 💻 Usage

* Use your mouse to draw freely on the canvas.
* Click **Undo** or **Redo** to step backward/forward.
* Toggle **Eraser Mode** to remove objects by clicking.
* Connect multiple tabs to test real-time sync.

---

### 🔧 Upcoming Features

* Save canvas as image or PDF
* Chat while collaborating
* Multi-page whiteboards
* Drag-to-erase or brush eraser

---

### 📁 Project Structure

```
whiteboard-app/
├── frontend/
│   ├── components/
│   │   └── Whiteboard.tsx
│   ├── utils/
│   │   └── socket.ts
│   ├── App.tsx
│   └── ...
├── backend/
│   └── index.js
├── README.md
└── package.json|
├── keycloak/
 └── docker-compose.ybl
```

---


### 🙌 Credits

* [Fabric.js](http://fabricjs.com/) for canvas abstraction
* [Socket.io](https://socket.io/) for real-time events
* Bootstrap for styling
