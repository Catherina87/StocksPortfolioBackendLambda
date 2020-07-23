## This is StocksPortfolioBackendLambda package

git / github:

mkdir StocksPortfolio <br />
in github: new repo StocksPortfolio, create repo <br />

git init <br />
add some files (example gitignore, readme)<br />
git add, commit<br />
git remote add origin https://… (see github page for this command when creating new repo) - we connect local git repo with remote github repo <br />
git push -u origin master - we push changes to remote github repo

project folder: 

create src folder<br />
create package.json (for dependencies and scripts)<br />
create tsconfig.json (for ts configurations)<br />
create webpack.config.js<br />

run npm install - it will download al the dependencies we indicated in the package.json file => node modules folder will be created.

webpack takes all the files and creates one file out of them called index.js; 
then it creates a folder dist and puts that index.js file in there.

In src create a file index.ts - for lambda function.

npm run-script build. 
This command will compile the ts code into js and creates an index.js file in the dist folder.
Then go to AWS console, create a lambda function there and paste the code from index.js (which is in dist folder) - this will be the code with data generated by webpack.

After modifying the code, npm run-script build command must be run again.
Then copy the code from dist/index.js and paste it to the lambda editor in aws console.
