
import React,{PureComponent} from 'react';
import {Switch,Router,Route} from 'react-router-dom';
import history from './history';
import routes from '../config/routes';
import config from '../config/config';

export default class RootRouter extends PureComponent{
  render(){
    return <Router history={history}>
      {
        getRoutes(routes,config.indexPath)
      }
    </Router>
  }
}
function getRoutes(routes,indexPath){
  return <Switch>
    {
      routes.map(({path:routePath,component:RouteComponent = 'div',children = [],indexPath}) => {
        const props = {
          key:routePath,
          path:routePath
        };
        if(children.length){
          props.render = props => {
            return <RouteComponent {...props}>
              {
                getRoutes(children.map(childRoute => ({...childRoute,path:pathJoin(routePath,childRoute.path)})),indexPath && pathJoin(routePath,indexPath))
              }
            </RouteComponent>
          }
        }else{
          props.component = RouteComponent;
        }
        return <Route {...props} />
      })
    }
    {
      indexPath ? <Route render={() => history.push(indexPath)} exact key="redirectRoute" path="/" /> : ''
    }
  </Switch>
}


function pathJoin(...args){
  return args.join('/').replace(/\/+/g,'/');
}
