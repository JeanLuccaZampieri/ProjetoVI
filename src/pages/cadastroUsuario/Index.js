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

import { Picker } from '@react-native-picker/picker';

import style from "./Style";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { firestore } from "../../firebaseConfig";
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
        idade: "",
        sexo: "",
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

    // Restrict age input to numbers and max 3 digits
    const handleAgeChange = (texto) => {
        const numericAge = texto.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        if (numericAge.length <= 3) {
            setUsuario((prevState) => ({ ...prevState, idade: numericAge }));
        }
    };

    const handleRegister = async () => {
        const auth = getAuth();
        const { email, senha, nome, cpf, telefone, cep, rua, numero, bairro, idade, sexo } = usuario;

        if (!email || !senha || !nome || !cpf || !telefone || !cep || !rua || !numero || !bairro || !idade || !sexo) {
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
                idade,
                sexo,
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
                        placeholder="Idade"
                        keyboardType="numeric"
                        value={usuario.idade}
                        onChangeText={handleAgeChange}
                    />
                    <Picker
                        selectedValue={usuario.sexo}
                        onValueChange={(itemValue) =>
                            setUsuario((prevState) => ({ ...prevState, sexo: itemValue }))
                        }
                        style={style.input}
                    >
                        <Picker.Item label="Sexo" value="default" />
                        <Picker.Item label="Masculino" value="M" />
                        <Picker.Item label="Feminino" value="F" />
                        <Picker.Item label="Outro" value="O" />
                        <Picker.Item label="Prefiro não informar" value="N" />
                    </Picker>
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
                    <TextInput
                        style={style.input}
                        placeholder="CPF"
                        onChangeText={(texto) =>
                            setUsuario((prevState) => ({ ...prevState, cpf: texto }))
                        }
                    />
                    <TextInput
                        style={style.input}
                        placeholder="Telefone"
                        onChangeText={(texto) =>
                            setUsuario((prevState) => ({ ...prevState, telefone: texto }))
                        }
                    />
                    <TextInput
                        style={style.input}
                        placeholder="CEP"
                        onChangeText={(texto) =>
                            setUsuario((prevState) => ({ ...prevState, cep: texto }))
                        }
                    />
                    <TextInput
                        style={style.input}
                        placeholder="Rua"
                        onChangeText={(texto) =>
                            setUsuario((prevState) => ({ ...prevState, rua: texto }))
                        }
                    />
                    <TextInput
                        style={style.input}
                        placeholder="Número"
                        onChangeText={(texto) =>
                            setUsuario((prevState) => ({ ...prevState, numero: texto }))
                        }
                    />
                    <TextInput
                        style={style.input}
                        placeholder="Bairro"
                        onChangeText={(texto) =>
                            setUsuario((prevState) => ({ ...prevState, bairro: texto }))
                        }
                    />


                    <Button title="Registrar" onPress={handleRegister} />
                </View>
            </View>
        </ScrollView>
    );
};

export default CadastroUsuario;
