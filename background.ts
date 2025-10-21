// Check and store model availability status when the service worker starts.
async function checkAndStoreModelStatus() {
  // Use `(self as any).LanguageModel` to satisfy TypeScript
  if (!(self as any).LanguageModel) {
    chrome.storage.local.set({ modelStatus: 'unavailable' });
    return;
  }
  try {
    const availability = await (self as any).LanguageModel.availability();
    chrome.storage.local.set({ modelStatus: availability });
  } catch (e) {
    console.error('Error checking model availability:', e);
    chrome.storage.local.set({ modelStatus: 'unavailable' });
  }
}

checkAndStoreModelStatus();

// --- Web Navigation Listener for SPAs ---
chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    // Inject the content script when the user navigates within a single-page application
    if (details.frameId === 0) { // Ensure it's the main frame
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ['content.js'],
      });
    }
  },
  { url: [{ schemes: ['http', 'https'] }] } // Only run on http and https pages
);

let activeProcessingRequests = 0;

chrome.runtime.onMessage.addListener(async (message, sender) => {
  console.log('Received message:', message);
  if (message.type === 'image') {
    activeProcessingRequests++;
    // Set status to processing only when the first image request comes in
    if (activeProcessingRequests === 1) {
      chrome.storage.local.set({ processingStatus: 'processing' });
      console.log('First image request, setting status to processing.');
    }

    chrome.storage.sync.get('blurEnabled', async (data) => {
      if (data.blurEnabled) {
        // Re-check and update status, as it might have changed (e.g., download finished)
        await checkAndStoreModelStatus();

        if (!(self as any).LanguageModel) {
          console.error(
            "Built-in AI not available. Please ensure 'chrome://flags/#prompt-api-for-gemini-nano' is enabled and the model is downloaded."
          );
          return;
        }

        const availability = (await chrome.storage.local.get('modelStatus'))
          .modelStatus;

        if (availability !== 'unavailable') {
          const session = await (self as any).LanguageModel.create({
            expectedInputs: [{ type: 'image' }],
          });

          const categories = [
            // --- Triggering Categories ---
            'Prepared Meals',
            'Desserts and Sweets',
            'Fast Food',
            'Diet-specific Foods',
            'Nutritional Information',
            'Weight Loss Ads',
            'Supplements & Diet Pills',
            'Exercise and Fitness',
            'Gym & Workout Equipment',
            'Before-and-After Body Photos',
            'Body Measurement',
            'Close-up Body Parts',
            'Medical Imagery',

            // --- Safe Categories ---
            'Landscapes and Nature',
            'Cityscapes',
            'Animals and Pets',
            'Clothing',
            'Vehicles & Transportation',
            'Architecture and Buildings',
            'Technology and Objects',
            'Household Items & Decor',
            'Portraits (non-body-focused)',
            'Crowds and Events',
            'Sports',
            'Illustrations & Cartoons',
            'Abstract Art',
            'Text and Documents',
            'Outer Space & Astronomy',
            'Other',
          ];

          const safeCategories = [
            'Landscapes and Nature',
            'Cityscapes',
            'Animals and Pets',
            'Clothing',
            'Vehicles & Transportation',
            'Architecture and Buildings',
            'Technology and Objects',
            'Household Items & Decor',
            'Portraits (non-body-focused)',
            'Crowds and Events',
            'Sports',
            'Illustrations & Cartoons',
            'Abstract Art',
            'Text and Documents',
            'Outer Space & Astronomy',
            'Other',
          ];

          const prompt = `You are a content moderator. Classify the main subject of this image into one of the following categories: ${categories.join(
            ', '
          )}. Respond with only the category name.`;

          const schema = {
            type: 'string',
            enum: categories,
          };

          try {
            console.log('Fetching image for AI processing:', message.src);
            const response = await fetch(message.src);
            const blob = await response.blob();

            console.log('Sending prompt to AI for image:', message.imageId);
            const result = await session.prompt(
              [
                {
                  role: 'user',
                  content: [
                    { type: 'text', value: prompt },
                    { type: 'image', value: blob },
                  ],
                },
              ],
              {
                responseConstraint: schema,
              }
            );

            const category = JSON.parse(result);
            console.log(`Image[${message.src}] classified as <${category}>`);

            // If the image is classified as a safe category, send a message back to the original tab.
            if (safeCategories.includes(category)) {
              if (sender.tab && sender.tab.id) {
                console.log(
                  'Sending un-blur message for safe image:',
                  message.imageId
                );
                chrome.tabs.sendMessage(sender.tab.id, {
                  isSafe: true,
                  imageId: message.imageId,
                });
              }
              activeProcessingRequests--;
              // If all requests are done, set status to idle
              if (activeProcessingRequests === 0) {
                chrome.storage.local.set({ processingStatus: 'idle' });
                console.log(
                  'All image processing complete, setting status to idle.'
                );
              }
            }
          } catch (e) {
            console.error('Error processing image with AI:', e);
            activeProcessingRequests--;
            // If all requests are done, set status to idle
            if (activeProcessingRequests === 0) {
              chrome.storage.local.set({ processingStatus: 'idle' });
              console.log(
                'All image processing complete (with errors), setting status to idle.'
              );
            }
          }
        } else {
          activeProcessingRequests--;
          // If all requests are done, set status to idle
          if (activeProcessingRequests === 0) {
            chrome.storage.local.set({ processingStatus: 'idle' });
            console.log(
              'All image processing complete (model unavailable), setting status to idle.'
            );
          }

        }
      }

    });

  }
});