import App from './App';
import inlineCss from '../../../dist/google-forms/index.css?inline';
import { initAppWithShadow } from '@extension/shared';

initAppWithShadow({ id: 'nugulform-google-forms', app: <App />, inlineCss });
