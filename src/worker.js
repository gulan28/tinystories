import { pipeline } from '@xenova/transformers';
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://cc2061293a464db2ae188bfd60d3213e@o4505275499806720.ingest.sentry.io/4505275563180032",
});


class GenerationPipeline {
  static task = 'text-generation';
  static model = 'roneneldan/TinyStories-33M';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    // Retrieve the translation pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
    let generator = await GenerationPipeline.getInstance(x => {
        // We also add a progress callback to the pipeline so that we can
        // track model loading.
        self.postMessage(x);
    });
  
    // Actually perform the translation
    let output = await generator(event.data.text, {
        // Allows for partial output
        callback_function: x => {
            self.postMessage({
                status: 'update',
                output: generator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true })
            });
        }
    });
  
    // Send the output back to the main thread
    self.postMessage({
        status: 'complete',
        output: output,
    });
});