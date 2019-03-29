import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';
import {
  withKnobs,
  text,
  array,
  object,
  boolean,
  number,
} from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import InfiniteScroll from './InfiniteScroll';
import ListItem from './ListItem';
import { FetchableState } from '../../store/reducers/utils';
import { PaginatedList } from '@bbp/nexus-sdk';

// @ts-ignore
const shuffleArray = (arr: any[]) =>
  arr
    .map((a: any) => [Math.random(), a])
    .sort((a: any, b: any) => a[0] - b[0])
    .map((a: any) => a[1]);

const exampleItems = [
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/InVitroSliceReconstructedPatchedNeuron',
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedCell',
  'http://www.w3.org/ns/prov#Entity',
  'https://bbp-nexus.epfl.ch/vocabs/bbp/neurosciencegraph/core/v0.1.0/ReconstructedPatchedCell',
  'http://www.w3.org/ns/dcat#Dataset',
];

const mockServer = (numberOfPages: number, pageSize: number) => {
  let position = 0;
  let items = exampleItems;
  return {
    next: () => {
      if (position >= numberOfPages) {
        return;
      }
      position = position + 1;
      items = shuffleArray(exampleItems);
    },
    getItems: () => items,
  };
};

storiesOf('Components/InfiniteScroll/Basic', module)
  .addDecorator(withKnobs)
  .add(
    'InfiniteScroll',
    withInfo(`
    Scroll all the way down and ask for more!

    ~~~js
    <InfiniteScroll
            makeKey={item => item}
            itemComponent={(item: any, index: number) => <p>{item}</p>}
            items={items}
            total={items.length}
            next={action('pagination-change')}
            loading={loading}
          />
  />
    ~~~
  `)(() => {
      return React.createElement(() => {
        const numberOfItems = number('number of items', 200);
        const isLoading = boolean('force loading?', false);
        const fetchablePaginatedList = object('fetachblePaginatedList', {
          isFetching: isLoading,
          error: null,
          data: {
            results: exampleItems,
            total: numberOfItems,
            index: 0,
          },
        });
        const next = () => {
          action('next')();
        };
        return (
          <div style={{ margin: '50px 40px 0px' }}>
            <h2>InfiniteScroll</h2>
            <InfiniteScroll
              makeKey={item => item}
              itemComponent={(item: any, index: number) => {
                return <ListItem label={item} id={`${item}-${index}`} />;
              }}
              next={next}
              fetchablePaginatedList={fetchablePaginatedList}
            />
          </div>
        );
      });
    })
  );

storiesOf('Components/InfiniteScroll/Simulated/OnClick', module)
  .addDecorator(withKnobs)
  .add(
    'InfiniteScroll',
    withInfo(`
    Scroll all the way down and ask for more!

    ~~~js
    <InfiniteScroll
            makeKey={item => item}
            itemComponent={(item: any, index: number) => <p>{item}</p>}
            items={items}
            total={items.length}
            next={action('pagination-change')}
            loading={loading}
          />
  />
    ~~~
  `)(() => {
      const starList = [
        {
          label: 'Acamar',
          description: `Originally called آخر النهر‎ ākhir al-nahr in Arabic, meaning "river's end", named because it was the brightest star in the constellation Eridanus (the River). (Before the 16th century, this was the last star in the Eridanus constellation; it was later extended to Achenar, below).`,
        },
        {
          label: 'Achernar',
          description: `The name was originally Arabic آخر النهر‎ ākhir al-nahr "river's end"`,
        },
        {
          label: 'Dziban',
          description: `From the traditional name of Dziban or Dsiban for ψ¹ Draconis, derived from Arabic al-dhi’ban, meaning "the two wolves" or "The two jackals".`,
        },
        {
          label: 'Libertas',
          description: `Name adopted by the IAU following the 2015 NameExoWorlds campaign.[5] Latin for 'liberty' ('Aquila' is Latin for 'eagle', a popular symbol of liberty).`,
        },
        {
          label: 'Lich',
          description: `A neutron star and pulsar with planets. Name adopted by the IAU following the 2015 NameExoWorlds campaign.[5] A lich is a fictional undead creature known for controlling other undead creatures with magic.[22]`,
        },
      ];

      const getStar = () => {
        return starList[Math.floor(Math.random() * starList.length)];
      };

      const makeRandom = (pageSize: number) => {
        const items = [];
        for (let i = 0; i < pageSize; i += 1) {
          items.push(getStar());
        }
        return items;
      };
      const fetchablePaginatedList = object('initial fetachblePaginatedList', {
        isFetching: true,
        error: null,
        data: null,
      });
      const pageSize = number('pageSize', 5);
      const totalItems = number('totalItems', 15);
      return React.createElement(() => {
        const [data, setData] = React.useState<
          FetchableState<PaginatedList<any>>
        >(fetchablePaginatedList);
        const [index, setIndex] = React.useState(0);
        React.useEffect(() => {
          setTimeout(() => {
            setData({
              isFetching: false,
              error: null,
              data: {
                index,
                total: totalItems,
                results: makeRandom(pageSize),
              },
            });
          }, 500);
        }, []);
        const next = () => {
          action('next')();
          setIndex(index + 1);
          setData({
            isFetching: true,
            error: null,
            data: null,
          });
          setTimeout(() => {
            setData({
              isFetching: false,
              error: null,
              data: {
                index,
                total: totalItems,
                results: makeRandom(pageSize),
              },
            });
          }, 500);
        };
        return (
          <div
            style={{
              margin: '50px',
              minHeight: '300px',
              width: '50%',
            }}
          >
            <h2>Stars ✨</h2>
            <InfiniteScroll
              makeKey={({ label, description }, index) => `${label}-${index}`}
              itemComponent={({ label, description }: any, index: number) => {
                return (
                  <ListItem
                    label={label}
                    description={description}
                    id={`${label}-${index}`}
                  />
                );
              }}
              next={next}
              fetchablePaginatedList={data}
            />
          </div>
        );
      });
    })
  );

storiesOf('Components/InfiniteScroll/Simulated/OnScroll', module)
  .addDecorator(withKnobs)
  .add(
    'InfiniteScroll',
    withInfo(`
    Scroll all the way down and ask for more!

    If you want to use the autofetching on scroll feature, just make sure that a scoll bar exists on the div
    probably the easiest way is just to add a maxHeight css value

    ~~~js
    <InfiniteScroll
            makeKey={item => item}
            itemComponent={(item: any, index: number) => <p>{item}</p>}
            items={items}
            total={items.length}
            next={action('pagination-change')}
            loading={loading}
          />
  />
    ~~~
  `)(() => {
      const starList = [
        {
          label: 'Acamar',
          description: `Originally called آخر النهر‎ ākhir al-nahr in Arabic, meaning "river's end", named because it was the brightest star in the constellation Eridanus (the River). (Before the 16th century, this was the last star in the Eridanus constellation; it was later extended to Achenar, below).`,
        },
        {
          label: 'Achernar',
          description: `The name was originally Arabic آخر النهر‎ ākhir al-nahr "river's end"`,
        },
        {
          label: 'Dziban',
          description: `From the traditional name of Dziban or Dsiban for ψ¹ Draconis, derived from Arabic al-dhi’ban, meaning "the two wolves" or "The two jackals".`,
        },
        {
          label: 'Libertas',
          description: `Name adopted by the IAU following the 2015 NameExoWorlds campaign.[5] Latin for 'liberty' ('Aquila' is Latin for 'eagle', a popular symbol of liberty).`,
        },
        {
          label: 'Lich',
          description: `A neutron star and pulsar with planets. Name adopted by the IAU following the 2015 NameExoWorlds campaign.[5] A lich is a fictional undead creature known for controlling other undead creatures with magic.[22]`,
        },
      ];

      const getStar = () => {
        return starList[Math.floor(Math.random() * starList.length)];
      };

      const makeRandom = (pageSize: number) => {
        const items = [];
        for (let i = 0; i < pageSize; i += 1) {
          items.push(getStar());
        }
        return items;
      };
      const fetchablePaginatedList = object('initial fetachblePaginatedList', {
        isFetching: true,
        error: null,
        data: null,
      });
      const pageSize = number('pageSize', 10);
      const totalItems = number('totalItems', 100);
      return React.createElement(() => {
        const [data, setData] = React.useState<
          FetchableState<PaginatedList<any>>
        >(fetchablePaginatedList);
        const [index, setIndex] = React.useState(0);
        React.useEffect(() => {
          setTimeout(() => {
            setData({
              isFetching: false,
              error: null,
              data: {
                index,
                total: totalItems,
                results: makeRandom(pageSize),
              },
            });
          }, 500);
        }, []);
        const next = () => {
          if (index >= totalItems / pageSize) {
            return;
          }
          action('next')();
          setIndex(index + 1);
          setData({
            isFetching: true,
            error: null,
            data: null,
          });
          setTimeout(() => {
            setData({
              isFetching: false,
              error: null,
              data: {
                index,
                total: totalItems,
                results: makeRandom(pageSize),
              },
            });
          }, 500);
        };
        return (
          <div
            style={{
              margin: '50px',
              width: '300px',
            }}
          >
            <h2>Stars ✨</h2>
            <InfiniteScroll
              style={{
                maxHeight: '600px',
                overflowY: 'scroll',
                backgroundColor: 'pink',
                borderRadius: '4px',
              }}
              makeKey={({ label, description }, index) => `${label}-${index}`}
              itemComponent={({ label, description }: any, index: number) => {
                return (
                  <ListItem
                    label={label}
                    description={description}
                    id={`${label}-${index}`}
                  />
                );
              }}
              next={next}
              fetchablePaginatedList={data}
            />
          </div>
        );
      });
    })
  );
