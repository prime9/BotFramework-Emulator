//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// for hot reloading
import { Provider } from 'react-redux';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { initializeIcons, initializeTheme } from '@bfemulator/ui-react';

import interceptError from './interceptError';
import interceptHyperlink from './interceptHyperlink';
import Main from './ui/shell/mainContainer';
import store from './data/store';
import { CommandServiceImpl } from './platform/commands/commandServiceImpl';
import { SettingsService } from './platform/settings/settingsService';
import { LogService } from './platform/log/logService';
import { showWelcomePage } from './data/editorHelpers';
import * as Commands from './commands';

// TEMP REMOVE
import * as NotificationActions from './data/action/notificationActions';
import { NotificationImpl } from '@bfemulator/app-shared';

initializeTheme('dark');
initializeIcons();
interceptError();
interceptHyperlink();

CommandServiceImpl.init();
SettingsService.init();
LogService.init();

Commands.registerCommands();

// Start rendering the UI
ReactDOM.render(
  React.createElement(Provider, { store }, React.createElement(Main as any)),
  document.getElementById('root')
);

// Tell the main process we're loaded
CommandServiceImpl.remoteCall('client:loaded')
  .then(() => {
    showWelcomePage();
    // do actions on main side that might open a document, so that they will be active over the welcome screen
    CommandServiceImpl.remoteCall('client:post-welcome-screen');
    
    // TEMP: REMOVE
    const notif1: NotificationImpl = new NotificationImpl();
    notif1.id = 'notif123';
    notif1.title = 'Some notification';
    notif1.message = 'Some notifcation message';
    const notif2: NotificationImpl = new NotificationImpl();
    notif2.id = 'notif1234';
    notif2.title = 'Some other notification';
    notif2.message = 'Some other notifcation message';
    store.dispatch(NotificationActions.add(notif1));
    store.dispatch(NotificationActions.add(notif2));
  })
  .catch(err => console.error(`Error occured during client:loaded: ${err}`));

if (module.hasOwnProperty('hot')) {
  (module as any).hot.accept();
}
