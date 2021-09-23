/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coder Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
// eslint-disable-next-line code-import-patterns, code-layering
import { IStateMainService } from 'vs/platform/state/electron-main/state';
import { IPartsSplash } from 'vs/platform/windows/common/windows';

const DEFAULT_BG_LIGHT = '#FFFFFF';
const DEFAULT_BG_DARK = '#1E1E1E';
const DEFAULT_BG_HC_BLACK = '#000000';

const THEME_STORAGE_KEY = 'theme';
const THEME_BG_STORAGE_KEY = 'themeBackground';
const THEME_WINDOW_SPLASH = 'windowSplash';

export const IThemeService = createDecorator<IThemeService>('themeService');

export interface IThemeService {
	getBackgroundColor(): string;

	getWindowSplash(): IPartsSplash | undefined;
	saveWindowSplash(splash: IPartsSplash): void;
}

export class ThemeService implements IThemeService {
	constructor(@IStateMainService private stateMainService: IStateMainService) { }

	getBackgroundColor(): string {
		let background = this.stateMainService.getItem<string | null>(THEME_BG_STORAGE_KEY, null);
		if (!background) {
			let baseTheme = this.stateMainService.getItem<string>(THEME_STORAGE_KEY, 'vs-dark').split(' ')[0];

			console.trace(baseTheme);
			background = (baseTheme === 'hc-black') ? DEFAULT_BG_HC_BLACK : (baseTheme === 'vs' ? DEFAULT_BG_LIGHT : DEFAULT_BG_DARK);
		}

		return background;
	}

	getWindowSplash(): IPartsSplash | undefined {
		return this.stateMainService.getItem<IPartsSplash>(THEME_WINDOW_SPLASH);
	}

	saveWindowSplash(splash: IPartsSplash): void {
		// Update in storage
		this.stateMainService.setItems([
			{ key: THEME_STORAGE_KEY, data: splash.baseTheme },
			{ key: THEME_BG_STORAGE_KEY, data: splash.colorInfo.background },
			{ key: THEME_WINDOW_SPLASH, data: splash }
		]);
	}
}
