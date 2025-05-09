# CodeLeap

CodeLeap is a web application designed to enhance your learning journey. It offers features to help you understand new concepts, practice with generated exercises, and improve your coding skills through AI-powered assistance.

## Features

- **Explain Concept:** Get clear explanations of programming concepts with examples and visualizations.
- **Generate Exercise:** Create custom exercises to test your knowledge and reinforce learning.
- **Improve Code:** Receive suggestions and improvements for your code snippets with detailed explanations.
- **Interactive Learning:** Engage with interactive tutorials and challenges.
- **Progress Tracking:** Monitor your learning progress and identify areas for improvement.
- **Learning Plan Feedback:** Provide feedback on learning plans with thumbs up/down ratings and comments.

## Technology Stack

- **Frontend:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS
- **AI Integration:** Custom AI flows for code analysis and exercise generation
- **UI Components:** Reusable component library
- **Database:** SQLite for storing user feedback

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/codeleap.git
   cd codeleap
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add the required environment variables.
   ```
   NEXT_PUBLIC_API_URL=your_api_url
   # Add other required environment variables
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
codeleap/
├── src/                   # Source files
│   ├── ai/                # AI-related functionality
│   │   └── flows/         # AI workflow definitions
│   ├── app/               # Next.js app directory
│   │   └── codeleap/      # Main application pages
│   ├── components/        # React components
│   │   ├── codeleap/      # Application-specific components
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions and libraries
├── data/                  # SQLite database directory
├── public/                # Static assets
├── components.json        # Component library configuration
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## Usage

### Explaining Concepts

1. Navigate to the "Explain" section
2. Enter the programming concept you want to understand
3. Receive a detailed explanation with examples

### Generating Exercises

1. Go to the "Exercise" section
2. Specify the difficulty level and topics
3. Get personalized exercises to solve

### Improving Code

1. Access the "Improve" section
2. Paste your code snippet
3. Receive suggestions for improvements and best practices

### Learning Plan Feedback

1. After generating a learning plan, use the feedback panel
2. Rate the learning plan with thumbs up/down
3. Optionally add a comment to provide more detailed feedback

## Contributing

We welcome contributions to CodeLeap! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.


