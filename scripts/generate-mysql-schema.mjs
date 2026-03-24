import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const entitiesDir = path.join(rootDir, 'entities');
const outputDir = path.join(rootDir, 'database', 'mysql');
const outputFile = path.join(outputDir, 'schema.sql');

const ignoredFiles = new Set([
  'Patient - Copy (5).json',
  'Patient - Copy (6).json',
  'Patient - Copy (7).json',
  'Patient - Copy (8).json',
  'Patient - Copy (9).json',
  'Patient - Copy (10).json',
]);

const longTextFields = new Set([
  'address',
  'allergies',
  'chief_complaint',
  'diagnosis',
  'discharge_summary',
  'examination_findings',
  'findings',
  'history_of_presenting_illness',
  'instructions',
  'message',
  'notes',
  'reply',
  'results',
  'storage_conditions',
  'treatment_plan',
]);

const integerHints = [
  'quantity',
  'stock',
  'reorder',
  'years',
];

function pascalToSnake(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function isIntegerField(fieldName) {
  return integerHints.some((hint) => fieldName.includes(hint));
}

function mapPropertyToSql(fieldName, schema, requiredFields) {
  let sqlType = 'VARCHAR(255)';
  const isRequired = requiredFields.has(fieldName);

  if (fieldName.endsWith('_id')) {
    sqlType = 'VARCHAR(64)';
  } else if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    sqlType = `ENUM(${schema.enum.map(sqlString).join(', ')})`;
  } else if (schema.type === 'string' && schema.format === 'date') {
    sqlType = 'DATE';
  } else if (schema.type === 'string' && longTextFields.has(fieldName)) {
    sqlType = 'TEXT';
  } else if (schema.type === 'number') {
    sqlType = isIntegerField(fieldName) ? 'INT' : 'DECIMAL(12,2)';
  } else if (schema.type === 'boolean') {
    sqlType = 'TINYINT(1)';
  } else if (schema.type === 'array' || schema.type === 'object') {
    sqlType = 'JSON';
  }

  const nullable = isRequired ? 'NOT NULL' : 'NULL';

  let defaultClause = '';
  if (schema.default !== undefined) {
    if (typeof schema.default === 'string') {
      defaultClause = ` DEFAULT ${sqlString(schema.default)}`;
    } else if (typeof schema.default === 'boolean') {
      defaultClause = ` DEFAULT ${schema.default ? 1 : 0}`;
    } else {
      defaultClause = ` DEFAULT ${schema.default}`;
    }
  }

  return `  \`${fieldName}\` ${sqlType} ${nullable}${defaultClause}`;
}

function buildTableSql(entityName, schema, knownTables) {
  const tableName = pascalToSnake(entityName);
  const requiredFields = new Set(schema.required || []);
  const properties = schema.properties || {};
  const columnLines = [
    '  `id` VARCHAR(64) NOT NULL',
  ];
  const indexLines = [];
  const foreignKeyLines = [];

  for (const [fieldName, definition] of Object.entries(properties)) {
    columnLines.push(mapPropertyToSql(fieldName, definition, requiredFields));

    if (fieldName.endsWith('_id')) {
      indexLines.push(`  KEY \`idx_${tableName}_${fieldName}\` (\`${fieldName}\`)`);

      const referencedTable = fieldName.slice(0, -3);
      if (knownTables.has(referencedTable) && referencedTable !== tableName) {
        foreignKeyLines.push(
          `  CONSTRAINT \`fk_${tableName}_${fieldName}\` FOREIGN KEY (\`${fieldName}\`) REFERENCES \`${referencedTable}\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`
        );
      }
    }
  }

  columnLines.push('  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');
  columnLines.push('  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  const tableLines = [
    `CREATE TABLE IF NOT EXISTS \`${tableName}\` (`,
    ...columnLines.map((line) => `${line},`),
    '  PRIMARY KEY (`id`)',
  ];

  if (indexLines.length > 0) {
    tableLines.push(`,${indexLines.join(',\n')}`);
  }

  if (foreignKeyLines.length > 0) {
    tableLines.push(`,${foreignKeyLines.join(',\n')}`);
  }

  tableLines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');

  return `-- ${entityName}\n${tableLines.join('\n')}`;
}

function main() {
  const files = fs
    .readdirSync(entitiesDir)
    .filter((fileName) => fileName.endsWith('.json') && !ignoredFiles.has(fileName))
    .sort();

  const entities = files.map((fileName) => {
    const filePath = path.join(entitiesDir, fileName);
    const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return schema;
  });

  const knownTables = new Set(entities.map((schema) => pascalToSnake(schema.name)));
  const ddl = [
    '-- Generated from entities/*.json',
    'CREATE DATABASE IF NOT EXISTS `mediflow` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',
    'USE `mediflow`;',
    '',
    'SET NAMES utf8mb4;',
    'SET FOREIGN_KEY_CHECKS = 0;',
    '',
    ...entities.map((schema) => buildTableSql(schema.name, schema, knownTables)),
    '',
    'SET FOREIGN_KEY_CHECKS = 1;',
    '',
  ].join('\n');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, ddl);
  console.log(`Wrote ${outputFile}`);
}

main();

