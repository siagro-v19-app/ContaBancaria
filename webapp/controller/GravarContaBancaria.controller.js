sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecContaBancaria/helpers/BancoHelpDialog",
	"br/com/idxtecContaBancaria/helpers/ContaContabilHelpDialog",
	"br/com/idxtecContaBancaria/services/Session"
], function(Controller, History, MessageBox, JSONModel, BancoHelpDialog, ContaContabilHelpDialog, Session) {
	"use strict";

	return Controller.extend("br.com.idxtecContaBancaria.controller.GravarContaBancaria", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarconta").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		bancoReceived: function() {
			this.getView().byId("banco").setSelectedKey(this.getModel("model").getProperty("/Banco"));
		},
		
		contaReceived: function() {
			this.getView().byId("contacontabil").setSelectedKey(this.getModel("model").getProperty("/ContaContabil"));
		},
		
		handleSearchBanco: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			BancoHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchConta: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			ContaContabilHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view"); 
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			this.getView().byId("banco").setValue(null);
			this.getView().byId("contacontabil").setValue(null);
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Nova Conta Bancária"
				});
				
				var oNovaConta = {
					"Id": 0,
					"Banco": "",
					"Agencia": "",
					"NumeroConta": "",
					"Titular": "",
					"ContaContabil": "",
					"Descricao": "",
					"Empresa" : Session.get("EMPRESA_ID"),
					"Usuario": Session.get("USUARIO_ID"),
					"EmpresaDetails": { __metadata: { uri: "/Empresas(" + Session.get("EMPRESA_ID") + ")"}},
					"UsuarioDetails": { __metadata: { uri: "/Usuarios(" + Session.get("USUARIO_ID") + ")"}}
				};
				
				oJSONModel.setData(oNovaConta);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Conta Bancária"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView()) === true) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createConta();
			} else if (this._operacao === "editar") {
				this._updateConta();
			}
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				oRouter.navTo("contabancaria", {}, true);
			}
		},
		
		_getDados: function() {
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			oDados.BancoDetails = {
				__metadata: {
					uri: "/Bancos('" + oDados.Banco + "')"
				}
			};
			
			oDados.PlanoContaDetails = {
				__metadata: {
					uri: "/PlanoContas('" + oDados.ContaContabil + "')"
				}
			};
			
			return oDados;
		},
		
		_createConta: function() {
			var that = this; 
			var oModel = this.getOwnerComponent().getModel();
	
			oModel.create("/ContaBancarias", this._getDados(), {
				success: function() {
					MessageBox.success("Conta bancária inserida com sucesso!",{
						onClose: function(){
							that._goBack();
						}
					});
				}
			});
		},
		
		_updateConta: function() {
			var that = this;
			var oModel = this.getOwnerComponent().getModel();

			oModel.update(this._sPath, this._getDados(), {
					success: function() {
					MessageBox.success("Conta bancária alterada com sucesso!", {
						onClose: function(){
							that._goBack();
						}
					});
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("descricao").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack();
		},
		
		getModel: function(sModel) {
			return this.getOwnerComponent().getModel(sModel);
		}
	});

});