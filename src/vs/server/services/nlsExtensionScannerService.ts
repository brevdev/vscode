/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Coder Technologies. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ExtensionIdentifier, IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ILogService } from 'vs/platform/log/common/log';
import { getTranslations } from 'vs/workbench/services/extensions/node/nls';
import { ExtensionScanner, ExtensionScannerInput } from 'vs/workbench/services/extensions/node/extensionPoints';
import { IEnvironmentServerService } from 'vs/server/services/environmentService';
import { IProductService } from 'vs/platform/product/common/productService';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';

export interface INLSExtensionScannerService {
	scanExtensions(language?: string): Promise<IExtensionDescription[]>
}

export const INLSExtensionScannerService = createDecorator<INLSExtensionScannerService>('INLSExtensionScannerService');

export class NLSExtensionScannerService implements INLSExtensionScannerService {
	constructor(
		@IEnvironmentServerService private environmentService: IEnvironmentServerService,
		@ILogService private logService: ILogService,
		@IProductService private productService: IProductService
	) { }

	public async scanExtensions(language?: string): Promise<IExtensionDescription[]> {
		const {
			builtinExtensionsPath,
			extraBuiltinExtensionPaths,
			extensionsPath,
			extraExtensionPaths,
			userDataPath
		} = this.environmentService;

		if (!language) {
			const { locale } = await this.environmentService.nlsConfigurationPromise;
			language = locale;
		}
		const translations = await getTranslations(language, userDataPath);

		const { version, date, commit } = this.productService;

		const scanMultiple = (isBuiltin: boolean, isUnderDevelopment: boolean, paths: string[]): Promise<IExtensionDescription[][]> => {
			return Promise.all(paths.map((path) => {
				return ExtensionScanner.scanExtensions(new ExtensionScannerInput(
					version,
					date,
					commit,
					language,
					!!process.env.VSCODE_DEV,
					path,
					isBuiltin,
					isUnderDevelopment,
					translations,
				), this.logService);
			}));
		};

		const scanBuiltin = async (): Promise<IExtensionDescription[][]> => {
			return scanMultiple(true, false, [builtinExtensionsPath, ...extraBuiltinExtensionPaths]);
		};

		const scanInstalled = async (): Promise<IExtensionDescription[][]> => {
			return scanMultiple(false, true, [extensionsPath!, ...extraExtensionPaths]);
		};

		return Promise.all([scanBuiltin(), scanInstalled()]).then((allExtensions) => {
			const uniqueExtensions = new Map<string, IExtensionDescription>();
			allExtensions.forEach((multipleExtensions) => {
				multipleExtensions.forEach((extensions) => {
					extensions.forEach((extension) => {
						const id = ExtensionIdentifier.toKey(extension.identifier);
						if (uniqueExtensions.has(id)) {
							const oldPath = uniqueExtensions.get(id)!.extensionLocation.fsPath;
							const newPath = extension.extensionLocation.fsPath;
							this.logService.warn(`${oldPath} has been overridden ${newPath}`);
						}
						uniqueExtensions.set(id, extension);
					});
				});
			});
			return Array.from(uniqueExtensions.values());
		});
	}
}
