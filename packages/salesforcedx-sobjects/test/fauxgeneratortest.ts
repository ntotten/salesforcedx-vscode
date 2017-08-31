import * as chai from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { FauxClassGenerator } from '../src/generator/fauxClassGenerator';

const expect = chai.expect;

describe('generatefield', function() {
  const sobject1: string =
    '{ "name": "Sobject1", "fields": [ {"name": "Foo", "type": "string", "referenceTo": []} ], "childRelationships": [] }';
  it('generated faux class should contain the proper fields', function() {
    let gen: FauxClassGenerator = new FauxClassGenerator();
    const classText = gen.generateFauxClassText(JSON.parse(sobject1));
    expect(classText).to.include('String Foo;');
  });
});

describe('generatefieldstofile', function() {
  const field1: string = '{"name": "Foo", "type": "string", "referenceTo": []}';
  const field2: string =
    '{"name": "Foo2", "type" : "boolean", "referenceTo": []}';
  const sobject1: string =
    '{ "name": "Custom__c", "fields": [ ' +
    field1 +
    ',' +
    field2 +
    ' ], "childRelationships": [] }';
  const sobjectFolder = './';
  it('generated faux class should create file with fields', async function(): Promise<
    void
  > {
    let gen: FauxClassGenerator = new FauxClassGenerator();
    const classPath = await gen.generateFauxClass(
      sobjectFolder,
      JSON.parse(sobject1)
    );
    expect(fs.existsSync(classPath)).to.be.true;
    const classText = fs.readFileSync(classPath, 'utf8');
    expect(classText).to.include('String Foo;');
  });
});

describe('generaterelationshiptofile', function() {
  const field1: string = '{"name": "Foo", "type": "string", "referenceTo": []}';
  const relation1: string =
    '{"referenceTo": ["Account"], "relationshipName": "Account__r"}';
  const sobject1: string =
    '{ "name": "Custom__c", "fields": [ ' +
    field1 +
    ',' +
    relation1 +
    ' ], "childRelationships": [] }';
  const sobjectFolder = './';
  it('generated faux class should create file with relationship', async function(): Promise<
    void
  > {
    let gen: FauxClassGenerator = new FauxClassGenerator();
    const classPath = await gen.generateFauxClass(
      sobjectFolder,
      JSON.parse(sobject1)
    );
    expect(fs.existsSync(classPath)).to.be.true;
    const classText = fs.readFileSync(classPath, 'utf8');
    expect(classText).to.include('String Foo;');
    expect(classText).to.include('Account Account__r');
  });
});

describe('generatechildrelationshiptofile', function() {
  const field1: string = '{"name": "Foo", "type": "string", "referenceTo": []}';
  const childRelation1: string =
    '{"childSObject": "Case", "relationshipName": "Case__r"}';
  const sobject1: string =
    '{ "name": "Custom__c", "fields": [ ' +
    field1 +
    ' ], "childRelationships": [' +
    childRelation1 +
    '] }';
  const sobjectFolder = './';
  it('generated faux class should create file with child relationship', async function(): Promise<
    void
  > {
    let gen: FauxClassGenerator = new FauxClassGenerator();
    const classPath = await gen.generateFauxClass(
      sobjectFolder,
      JSON.parse(sobject1)
    );
    expect(fs.existsSync(classPath)).to.be.true;
    const classText = fs.readFileSync(classPath, 'utf8');
    expect(classText).to.include('List<Case> Case__r');
  });
});
