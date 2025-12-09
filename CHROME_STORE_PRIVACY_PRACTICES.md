# Chrome Web Store Privacy Practices

## Single Purpose

The single purpose of this extension is to automatically fill in personal information (such as Telegram Handle, Twitter Handle, wallet addresses, etc.) that users repeatedly need to enter when filling out Google Forms, thereby improving user convenience. The extension provides functionality to automatically populate Google Forms pages with information that users have saved once.

## Detailed Description (25+ characters)

NugulForm is a Chrome extension that automatically fills in repetitive information when filling out Google Forms. It automatically populates Google Forms pages with information that users have saved once, such as Telegram Handle, Twitter Handle, Google account, wallet addresses (EVM, Sol, etc.), YouTube channel, phone number, and more. Through smart field matching functionality, it automatically recognizes various forms of form labels and fills in the correct fields with information, while also automatically selecting positive responses such as "Yes", "네", "예", etc. All user information is stored locally in the browser and is not transmitted to external servers, ensuring safe usage.

## Storage Permission Usage Justification

The storage permission is required to safely store personal information entered by users (such as Telegram Handle, Twitter Handle, wallet addresses, etc.) in the browser's local storage. This permission allows the extension to persistently maintain information that users have saved once, and to load saved information when using auto-fill functionality on Google Forms pages. All data is stored only in the user's browser and is not transmitted to external servers.

## Scripting Permission Usage Justification

The scripting permission is required to dynamically inject scripts into Google Forms pages to execute auto-fill functionality. The extension needs this permission to find form fields on pages, input saved user information into those fields, and select appropriate options when choices are available. This permission enables the extension to automatically fill in Google Forms with information saved by users.

## Tabs Permission Usage Justification

The tabs permission is required to check whether the currently active browser tab is a Google Forms page and to activate auto-fill functionality on that page. The extension needs access to the current tab's URL information to detect when users visit Google Forms pages and provide auto-fill functionality at the appropriate time. This permission allows the extension to operate only on Google Forms pages.

## Notifications Permission Usage Justification

The notifications permission is used to provide users with notifications about extension status changes or important alerts. For example, it can display notifications when auto-fill operations are completed, or send notifications when extension settings are changed. This allows users to easily understand the extension's operational status.

## SidePanel Permission Usage Justification

The sidePanel permission is required to display the extension's side panel UI. It provides an intuitive interface through the side panel when users access extension features or change settings. Users can view saved information or execute auto-fill functionality through the side panel.

## Host Permissions (<all_urls>) Usage Justification

Host permissions are required to provide auto-fill functionality on Google Forms pages (https://docs.google.com/forms/*). The extension needs access to these pages to detect form fields on Google Forms pages and automatically input saved user information into those fields. Additionally, it uses content scripts to analyze the page's DOM structure to find appropriate input fields and fill them with information.