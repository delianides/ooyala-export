import gql from 'graphql-tag';
import fetch from 'node-fetch';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import json2csv from 'json2csv';
import fs from 'fs';
import _ from 'lodash';

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:8888/graphql', fetch: fetch }),
  cache: new InMemoryCache()
});

async function getAssets(){
  client.query({
    query: gql`
    query Backlot{
      backlot{
        name
        description
        createdAt
        labels{
          name
        }
        embedCode
        source
        duration
      }
    }
  `,
  })
    .then(data => {
      let backlot = [];
      const fields = [ "name", "description", "createdAt", "labels" , "embedCode", "source", "duration" ];
      data.data.backlot.map(a => {
        if (a.source){
          let asset = Object.assign({},
            { name: a.name },
            { description: a.description },
            { createdAt: a.createdAt },
            { labels: `${_.map(a.labels, 'name').join(",")}` },
            { embedCode: a.embedCode },
            { source: a.source },
            { duration: a.duration },
          );
          backlot.push(asset);
        };
      });
      const csv = json2csv({ data: backlot, fields: fields })
      fs.writeFile('assets.csv', csv, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
      console.log("COUNT", backlot.length);
    })
    .catch(error => console.error(error));
}

getAssets();




