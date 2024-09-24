import { StyleSheet } from "react-native";

const style = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 35,
        width: "100%",
        justifyContent: "center",
        alignItems: "center"
    }, containerForm: {
        justifyContent: "center",
        alignItems: "center",
        width: "90%",
        height: "50%",
    }, inputFullWidth: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        width: '100%',
    },input: {
        backgroundColor: "#ddd",
        color:"black",
        width: "85%",
        height: 55,
        borderRadius: 25,
        fontSize:16,
        margin: 10,
        padding: 11
    },
    inputMenor: {
        backgroundColor: "#ddd",
        color:"black",
        width: "40%",
        height: 54,
        borderRadius: 25,
        flexDirection: 'row',
        fontSize:16,
        margin: 10,
        padding: 10
    },
    inputData:{
        backgroundColor: "#ddd",
        color:"black",
        width: "40%",
        height: 55,
        borderRadius: 25,
        flexDirection: 'row',
        fontSize:16,
        margin: 10,
        padding: 10
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    botaoContainer: {
        marginTop:20,
        width: "100%",
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: "center"
    }, botao: {
        backgroundColor: "#3556e3",
        color: "white",
        width: "40%",
        height: 50,
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 25,
        textAlign: "center",
        alignContent: 'center',
        justifyContent: 'center',
    }, entrarTexto: {
        fontSize: 23,
        fontStyle: "italic",
    }
    , textoEndereço: {
        fontSize: 23,
        fontStyle: "italic",
        borderBottomWidth:0.5,
        borderColor:"black"
    }
})
export default style;