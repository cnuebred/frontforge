import { Pocket } from "../src/pocket";
import { Widget } from "../src/widget";
import { ContainerWidget } from "../src/widget_container";

class TableWidget extends ContainerWidget {
  headers: string[];
  data: Pocket<any>;

  constructor(headers: string[], rows: any[]) {
    super('table');
    this.headers = headers;
    this.data = new Pocket({rows});
    this.buildTable();
  }

  buildTable() {
    // this.headers.forEach(header => {
    //   this.add(new Widget('tr', `<th>${header}</th>`))
    // })
    this.add(new Widget('tr', this.headers.map(header => `<th>${header}</th>`).join('')));
    this.data.target.rows.forEach((row, index) => {
      console.log(row)
      const rowWidget = new Widget('tr', row.map(cell => `<td>${cell}</td>`).join(''));      
      this.add(rowWidget);
      rowWidget.event('click', () => this.editRow(index));
    });
  }

  editRow(index: number) {
    console.log(`Edytowanie wiersza ${index}`);
  }

  addRow(row: any[]) {
    this.data.target.rows.push(row);
    this.buildTable();
  }

  removeRow(index: number) {
    this.data.target.rows.splice(index, 1);
    this.buildTable();
  }

  generateSQL(): string {
    let sql = `INSERT INTO table_name (${this.headers.join(", ")}) VALUES `;
    this.data.target.rows.forEach((row, index) => {
      const values = row.map(value => `'${value}'`).join(", ");
      sql += `(${values})`;
      if (index < this.data.target.rows.length - 1) {
        sql += ", ";
      }
    });
    sql += ";";
    return sql;
  }
}

// Inicjalizacja tabeli SQL
const headers = ["ID", "Name", "Age"];
const initialData = [
  [1, "Alice", 25],
  [2, "Bob", 30]
];

const sqlTable = new TableWidget(headers, initialData);

// Formularz dodawania nowych wierszy
const inputID = new Widget('input');
const inputName = new Widget('input');
const inputAge = new Widget('input');
const addButton = new Widget('button', 'Dodaj wiersz');

addButton.event('click', () => {
  const newRow = [inputID.self['value'], inputName.self['value'], inputAge.self['value']];
  sqlTable.addRow(newRow);
  inputID.self['value'] = '';
  inputName.self['value'] = '';
  inputAge.self['value'] = '';
});

// Przycisk do generowania SQL
const generateSQLButton = new Widget('button', 'Generuj SQL');
const sqlOutput = new Widget('pre', '');

generateSQLButton.event('click', () => {
  const sql = sqlTable.generateSQL();
  sqlOutput.self.innerHTML = sql;
});

// Dodanie widgetów do głównego kontenera
const appContainer = new ContainerWidget();
appContainer.add(new Widget('h1', 'Inteligentny edytor tablic SQL'));
appContainer.add(sqlTable);
appContainer.add(new Widget('p', 'Dodaj nowy wiersz:'));
appContainer.add(inputID);
appContainer.add(inputName);
appContainer.add(inputAge);
appContainer.add(addButton);
appContainer.add(generateSQLButton);
appContainer.add(sqlOutput);

// Podłączenie do DOM
appContainer.hook('app');
appContainer.build();
