/**
 * Created by askuznetsov on 7/23/2014.
 */
process.on("message", function(data) {
    console.log('Child ' + process.argv[2], data);
    process.send({
        child: 'ok'
    })
    process.disconnect();
});