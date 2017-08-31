/*
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  SObjectDescribe,
  SObjectDescribeGlobal,
  SObject,
  ChildRelationship,
  Field
} from '../describe';

export class FauxClassGenerator {
  public async generate(projectPath: string, type: string) {
    const describeGlobal = new SObjectDescribeGlobal();
    const describe = new SObjectDescribe();
    const sobjects = await describeGlobal.describeGlobal(projectPath, type);
    let standardSObjects: SObject[] = [];
    let customSObjects: SObject[] = [];
    console.log(sobjects.length);
    for (let i = 0; i < sobjects.length; i++) {
      const sobject = await describe.describe(projectPath, sobjects[i]);
      console.log(sobject.name);
      if (sobject.custom) {
        customSObjects.push(sobject);
      } else {
        standardSObjects.push(sobject);
      }
    }

    const standardSObjectFolderPath = path.join(
      projectPath,
      '.sfdx',
      'sobjects',
      'standardsobjects'
    );
    const customSObjectFolderPath = path.join(
      projectPath,
      '.sfdx',
      'sobjects',
      'customsobjects'
    );

    for (let sobject of standardSObjects) {
      await this.generateFauxClass(standardSObjectFolderPath, sobject);
    }
    for (let sobject of customSObjects) {
      await this.generateFauxClass(customSObjectFolderPath, sobject);
    }
  }

  private generateChildRelationship(rel: ChildRelationship): string {
    if (rel.relationshipName) {
      return 'List<' + rel.childSObject + '> ' + rel.relationshipName;
    } else {
      // TBD ignore ? or use "field" and strip Id off end ?
      return '';
    }
  }

  private generateField(field: Field): string {
    if (field.referenceTo.length == 0) {
      return (
        field.type.charAt(0).toUpperCase() +
        field.type.slice(1) +
        ' ' +
        field.name
      );
    } else {
      return field.referenceTo + ' ' + field.relationshipName;
    }
  }

  private static fieldName(decl: string) {
    return decl.substr(decl.indexOf(' ') + 1);
  }

  // VisibleForTesting
  public async generateFauxClass(
    folderPath: string,
    sobject: any
  ): Promise<string> {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
    const fauxClassPath = path.join(folderPath, sobject.name + '.cls');

    fs.writeFileSync(fauxClassPath, this.generateFauxClassText(sobject));

    return fauxClassPath;
  }

  //VisibleForTesting
  public generateFauxClassText(sobject: SObject): string {
    let declarations: string[] = [];
    for (let rel of sobject.childRelationships) {
      declarations.push(this.generateChildRelationship(rel));
    }
    for (let field of sobject.fields) {
      declarations.push(this.generateField(field));
    }

    declarations.sort(function nameCompare(
      first: string,
      second: string
    ): number {
      return FauxClassGenerator.fieldName(first) >
      FauxClassGenerator.fieldName(second)
        ? 1
        : -1;
    });

    const indentAndModifier = '    global ';
    const generatedClass: string =
      'global class ' +
      sobject.name +
      ' \n{\n' +
      indentAndModifier +
      declarations.join(';\n' + indentAndModifier) +
      ';\n\n' +
      indentAndModifier +
      sobject.name +
      ' () \n    {\n    }\n}';

    return generatedClass;
  }
}
