import cron from "node-cron";
import { updateDivisaValues } from "../services/divisaService.js";

export function startDivisaUpdateJob() {
  cron.schedule("0 1 * * *", async () => {
    // Cambiar a 0 1 * * * para ejecutar diariamente a la 1 AM
    try {
      const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
      console.log(API_KEY)

      // Using the live endpoint with official syntax
      const response = await fetch(
        `http://api.exchangerate.host/live?access_key=${API_KEY}&source=MXN&currencies=USD,AUD,GBP&format=1`
      );

      if (!response.ok) throw new Error("Failed to fetch exchange rates");

      const data = await response.json();
      console.log("fetched exchange rates:", data);

      // Check if the API call was successful
      if (!data.success) {
        throw new Error(`API Error: ${data.error?.info || "Unknown error"}`);
      }

      // The live endpoint returns quotes in format: MXNUSD, MXNAUD, etc.
      // We need to extract the rates and create our rates object
      const rates = {
        MXN: 1.0, // Base currency
      };

      // Extract rates from quotes (format: SOURCECURRENCY = rate)
      if (data.quotes) {
        Object.entries(data.quotes).forEach(([key, value]) => {
          // Remove the source currency prefix (MXN) to get target currency
          const targetCurrency = key.replace("MXN", "");
          if (targetCurrency) {
            rates[targetCurrency] = value;
          }
        });
      }

      console.log("processed rates:", rates);

      await updateDivisaValues(rates);
      console.log("Divisa update completed successfully");
    } catch (err) {
      console.error("Divisa update job failed", err);
    }
  });
}
