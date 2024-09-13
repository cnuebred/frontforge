import { Widget } from '../src/widget'
import {  Flex, flex_direction_e, flex_justify_e } from '../src/modules/flex'
import { Grid } from '../src/modules/grid'



const row = Flex([
  new Widget('span', 'Strona 1'),
  new Widget('span', 'Strona 2'),
  Flex([
    new Widget('span', 'Strona 2.1'),
    new Widget('span', 'Strona 2.2'),
    new Widget('span', 'Strona 2.3'),
    new Widget('span', 'Strona 2.4'),
    new Widget('span', 'Strona 2.5'),
  ],{
    direction: flex_direction_e.column,
    justify_content: flex_justify_e.space_between
  }),
  new Widget('span', 'Strona 3'),
], {
  direction: flex_direction_e.row,
  justify_content: flex_justify_e.space_between,
  height: 150
})



row.hook('app')

const grid = Grid([
  [new Widget('span', 'Strona 1.1'), null, {
    widget: new Widget('span', 'Strona 1.2'), 
    row_span:'span 3'
  }],
  [new Widget('span', 'Strona 2.1'), null],
  [null, new Widget('span', 'Strona 4.1')],
  [new Widget('span', 'Strona 3.1'), new Widget('span', 'Strona 3.2')],
])
grid.hook('app')
