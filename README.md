
# 🎲 Batch - Random Group Generator

Batch is a simple and intuitive tool for generating random groups from a list of participants. Whether you're organizing students for a class activity, forming teams for a workshop, or just need a quick way to create pairs for an ice-breaker, Batch helps you do it with ease and a bit of flair.


## ✨ Features

- **Flexible Participant Input**: Generate groups by either specifying a total number of participants or by pasting a custom list of names.
- **Customizable Groups**: Easily set the desired team size and a custom prefix for group names (e.g., "Team", "Squad", "Group").
- **Suspense Mode**: Add some excitement by revealing the generated teams one by one.
- **Drag & Drop Reorganization**: Fine-tune the generated groups by simply dragging and dropping members between teams.
- **Reshuffle & Download**: Instantly reshuffle teams with a single click or download the final groups as a `.txt` file.
- **Persistent Settings**: Your preferences for team size, custom names, and other options are automatically saved in your browser for your next visit.
- **Productivity-Focused**: Use keyboard shortcuts to generate (`Ctrl+Enter`) and reshuffle (`Ctrl+R`) groups instantly.
- **Modern & Responsive UI**: A clean, beautiful, and fully responsive interface built with shadcn/ui and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Drag & Drop**: [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd)
- **Form Management**: [React Hook Form](https://react-hook-form.com/)

## 🛠️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 18 or later) and [npm](https://www.npmjs.com/) installed on your machine.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/muhammedbasith/batch.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd batch
    ```
3.  **Install NPM packages:**
    ```sh
    npm install
    ```
4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:8080`.

## 💻 How to Use

1.  Open the application in your browser.
2.  Toggle **"Use custom names"** if you have a specific list of participants. Otherwise, just set the **"Total participants"** number.
3.  Adjust the **"Team size"** and other settings like the group name prefix.
4.  Enable **"Suspense mode"** if you want to reveal teams dramatically.
5.  Click the **"Generate Groups"** button or press `Ctrl + Enter`.
6.  The results will appear in a modal. From there, you can:
    -   Drag and drop members to adjust teams.
    -   Click **"Reshuffle"** (`Ctrl + R`) to generate new combinations.
    -   Click **"Download"** to save the groups to a text file.

## ⌨️ Keyboard Shortcuts

-   `Ctrl` + `Enter`: Generate groups.
-   `Ctrl` + `R`: Reshuffle existing groups.

## 📂 Project Structure

<details>
<summary>Click to view the directory structure</summary>

```
└── batch/
    ├── README.md
    ├── components.json
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── vite.config.ts
    ├── public/
    │   └── robots.txt
    └── src/
        ├── App.css
        ├── App.tsx
        ├── index.css
        ├── main.tsx
        ├── components/
        │   └── ui/
        │       ├── accordion.tsx
        │       ├── alert-dialog.tsx
        │       ├── ... (40+ shadcn components)
        │       └── use-toast.ts
        ├── hooks/
        │   ├── use-mobile.tsx
        │   └── use-toast.ts
        ├── lib/
        │   └── utils.ts
        └── pages/
            ├── Index.tsx
            └── NotFound.tsx
```
</details>

## 📄 License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

---

Made with ❤️ by Muhammed Basith.