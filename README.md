# Mindful Browsing

A Chrome Extension for a safer and more mindful online experience, built for the Google Chrome AI 2025 Competition.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## About The Project

The "Mindful Browsing" extension was born from a desire to explore the new frontier of on-device AI. The potential of a local, multimodal AI API immediately captured my imagination. I asked myself: what content might people genuinely need help avoiding for their well-being? This led me to consider the struggles of individuals with eating disorders, for whom everyday web browsing can be a minefield of triggering content.

The idea solidified: I could use Chrome's on-device Gemini Nano model to create a safer, more mindful browsing experience. The extension proactively identifies and blurs potentially harmful images, giving users control over their online environment without forcing them to self-censor their browsing habits.

[Demo Video](https://www.youtube.com/watch?v=fxgsXNLAsrQ)

### Core Features

*   **Proactive Blurring:** By default, all images on a webpage are blurred immediately upon loading, ensuring potentially triggering content is hidden before it can be seen.
*   **On-Device AI Classification:** The extension utilizes Chrome's experimental, built-in Gemini Nano model to analyze images locally on the user's machine. This means image data is never sent to a server, guaranteeing privacy.
*   **Intelligent Un-blurring:** Images are classified by the AI into a detailed set of categories. Images classified as "safe" (e.g., 'Landscapes and Nature', 'Architecture', 'Technology') are automatically un-blurred, while triggering categories (e.g., 'Prepared Meals', 'Body Measurement', 'Weight Loss Ads') remain hidden.
*   **User-Friendly Interface:** A simple, calming popup interface allows the user to easily toggle the feature on and off and view the real-time status of the AI model.
*   **Modern Web Compatibility:** Engineered to work seamlessly with modern websites, including Single-Page Applications (SPAs) and pages that use lazy-loading or dynamically add images with JavaScript.

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

This extension relies on experimental Chrome features. You will need:
*   **Google Chrome Canary** [download](https://www.google.com/chrome/canary/)
*   **Node.js** and **npm** [installed](https://nodejs.org/en/download) on your machine. 

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/leinadsened/mindful-browsing.git
    ```

2.  **Install NPM packages:**
    ```sh
    cd mindful-browsing
    npm install
    ```

3.  **Build the extension:**
    ```sh
    npm run build
    ```
    This will create a `dist` directory with the bundled extension files.

4.  **Enable Experimental Chrome Flags:**
    Open Chrome Canary and navigate to `chrome://flags`. Enable the following flags:
    *   `#prompt-api-for-gemini-nano`
    *   `#optimization-guide-on-device-model`

    After enabling them, restart your browser.

5.  **Load the Extension:**
    *   Navigate to `chrome://extensions`.
    *   Enable "Developer mode" in the top right corner.
    *   Click on "Load unpacked".
    *   Select the `dist` directory from this project.

6.  **Enable the On-Device Model:**
    *   The first time you use the extension, the Gemini Nano model may need to download.
    *   Go to `chrome://components` and find the "On-Device Model" component. You can trigger an update here if needed.
    *   The extension popup will show the model's status (`downloading`, `available`, etc.).

## Usage

Once installed and enabled, the extension will automatically start blurring images on any webpage you visit.

*   Click the extension icon in the toolbar to open the popup.
*   Use the toggle switch in the popup to turn the blurring service on or off.
*   The popup will inform you if the AI model is ready or if images are being processed.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
