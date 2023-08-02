# Botpress Mailchimp Integration

This integration allows you to connect your Botpress chatbot with Mailchimp, a popular email marketing platform. With this integration, you can easily manage your email campaigns and subscribers directly from your chatbot.

To set up the integration, you’ll need to provide your Mailchimp API key and Server Prefix (e.g. us19). Once the integration is set up, you can use the built-in actions to add customer to campaign or list, send mass campaigns, and more.

For more detailed instructions on how to set up and use the Botpress Mailchimp integration, please refer to our documentation.

## Prerequisites

Before enabling the Botpress Mailchimp Integration, please ensure that you have the following:

- A Botpress cloud account.
- Access to a Mailchimp account.
- API key generated from your Mailchimp account.

## Enable Integration

To enable the Mailchimp integration in Botpress, follow these steps:

- Access your Botpress admin panel.
- Navigate to the “Integrations” section.
- Locate the Mailchimp integration and click on “Enable” or “Configure.”
- Provide the required API key, Server prefix (e.g. us19) and configuration details.
- Save the configuration.

## Usage

Once the integration is enabled, you can start sending and receiving emails within your Botpress chatbot. The integration offers actions such as `addCustomerToCampaign`, `addCustomerToList`, and `sendMassEmailCampaign` that can be used to interact with your Mailchimp account.

For more detailed information and examples, refer to the Botpress documentation or the Mailchimp documentation for configuring the integration.

## Limitations

### API Request Limits

Mailchimp imposes some limits on API requests to prevent a single user from making too many expensive calls at once. Exceeding these limits can result in your API access being disabled, so it’s important to be aware of the quantity and complexity of your requests.

- The Marketing API has a limit of 10 concurrent connections for your API key.
- Requests to the Marketing API time out at 120 seconds, so if you’re making a long-running request that won’t finish in that time, you may need to use the Batch endpoint to complete the request.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvement, please submit them via the project’s issue tracker. Pull requests are also appreciated.

Enjoy the seamless email integration between Botpress and Mailchimp!