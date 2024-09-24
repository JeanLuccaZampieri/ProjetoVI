import React, { useState } from "react";
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    Button
} from "react-native";
import style from "./Style";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { firestore } from "../../firebaseConfig"; // Certifique-se de importar corretamente
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

const CadastroUsuario = () => {
    const navigation = useNavigation();

    const [data, setData] = useState("");
    const [usuario, setUsuario] = useState({
        nome: "",
        email: "",
        senha: "",
        dataNascimento: "",
        cpf: "",
        telefone: "",
        cep: "",
        rua: "",
        numero: "",
        bairro: "",
        tipo: 1,
        aceitouTermos: false,
    });

    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);
    const [formattedDate, setFormattedDate] = useState("");

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const showDatepicker = () => {
        setShow(true);
    };

    const handleDateChange = (event, selectedDate) => {
        setShow(false);
        if (selectedDate) {
            setDate(selectedDate);
            setFormattedDate(formatDate(selectedDate));
            setUsuario((prevState) => ({
                ...prevState,
                dataNascimento: formatDate(selectedDate),
            }));
        }
    };

    const handleRegister = async () => {
        const auth = getAuth();
        const { email, senha, nome, cpf, telefone, cep, rua, numero, bairro } = usuario;

        if (!email || !senha || !nome || !cpf || !telefone || !cep || !rua || !numero || !bairro) {
            Alert.alert("Erro", "Por favor, preencha todos os campos.");
            return;
        }

        try {
            // Cria usuário com Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const userId = userCredential.user.uid;

            // Salva os dados adicionais do usuário no Firestore
            await firestore.collection("users").doc(userId).set({
                nome,
                email,
                dataNascimento: formattedDate,
                cpf,
                telefone,
                endereco: {
                    cep,
                    rua,
                    numero,
                    bairro,
                },
            });

            Alert.alert("Sucesso", "Usuário registrado com sucesso!");
            navigation.navigate("Login");
        } catch (error) {
            console.error("Erro ao registrar usuário: ", error);
            Alert.alert("Erro", "Falha ao registrar o usuário. " + error.message);
        }
    };

    return (
        <ScrollView style={{ flex: 1, width: "100%", height: "100%" }}>
            <View style={style.container}>
                <View style={style.containerForm}>
                    <Image
                        source={require("../../img/iconeAdd.png")}
                        style={{ width: 70, height: 70 }}
                    />
                    <Text style={style.textoEndereço}>Dados Pessoais</Text>
                    <TextInput
                        style={style.input}
                        placeholder="Nome"
                        onChangeText={(texto) =>
                            setUsuario((prevState) => ({ ...prevState, nome: texto }))
                        }
                    />
                    <TextInput
                        style={style.input}
                        placeholder="E-mail"
                        onChangeText={(texto) =>
                            setUsuario((prevState) => ({ ...prevState, email: texto }))
                        }
                    />
                    <TextInput
                        style={style.input}
                        placeholder="Senha"
                        secureTextEntry={true}
                        onChangeText={(texto) =>
                            setUsuario((prevState) => ({ ...prevState, senha: texto }))
                        }
                    />
                    {/* Outras entradas de usuário */}

                    <Button title="Registrar" onPress={handleRegister} />

                </View>
            </View>
        </ScrollView>
    );
};

export default CadastroUsuario;
