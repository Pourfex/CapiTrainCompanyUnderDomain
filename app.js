console.log("started");

const mongoose = require('mongoose');
const databaseService = require ('./Database/DatabaseService');

var url = 'mongodb://localhost/CapiTrain2';

const fs=require('fs');
const data=fs.readFileSync('./companydomaintoname.json', 'utf8');
const matcher=JSON.parse(data);

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var connection = mongoose.connection;

fillDb = async function(packets){
    console.log(packets.length)
    for(let packet of packets){
        let company = undefined         
        if(!packet.company){
            if(!packet.domain){
                console.log("no domain, finishing")
                return;
            }
            try{
                let domain = packet.domain
                if(matcher[domain]) {
                    company = matcher[domain]
                    console.log('Find company name by matcher')
                }else{
                    let regexCompany = tryRegex(domain)
                    if(regexCompany !== undefined) {
                        console.log('Find company name by Regex')
                        company = regexCompany
                        
                    }
                }

                if(company === undefined){
                    //console.log('Cannot find company name')
                }else{
                    console.log('will save packet')
                    console.log(company)
                    databaseService.SavePacketWithCompany(packet, company)
                }             
            }catch(e){
                console.log(e);
            }
        }                                
    };    
}

connection.once('open', function() {
    console.log("Connection successful");

    databaseService.PacketModel.find(async function(err, packets){

        console.log(packets); 
        let i,j, temparray, chunk = 100
        for (i=0,j=packets.length; i<j; i+=chunk) {
            temparray = packets.slice(i,i+chunk);
            await fillDb(temparray)
        }

        
    });
  });

  function tryRegex(domain){
        let facebookRegexp = /[fb]/y
        if(facebookRegexp.test(domain)){
            return "Facebook"
        }
        let facebookRegexp2 = /[facebook]/y
        if(facebookRegexp2.test(domain)){
            return "Facebook"
        }
        return undefined
  }