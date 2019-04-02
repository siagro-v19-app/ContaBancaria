sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"idxtec/lib/fragment/ContaContabilHelpDialog"
], function(Controller, History, MessageBox, JSONModel, ContaContabilHelpDialog) {
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
		
		handleSearchConta: function(oEvent){
			var oHelp = new ContaContabilHelpDialog(this.getView(), "contacontabil");
			oHelp.getDialog().open();
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view"); 
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
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
					"Descricao": ""
				};
				
				oJSONModel.setData(oNovaConta);
				
				this.getView().byId("banco").setSelectedKey("");
				this.getView().byId("contacontabil").setSelectedKey("");
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Conta Bancária"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					},
					error: function(oError) {
						MessageBox.error(oError.responseText);
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
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
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
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("banco").getSelectedItem() === null || oView.byId("agencia").getValue() === ""
			|| oView.byId("numeroconta").getValue() === "" || oView.byId("titular").getValue() === ""
			|| oView.byId("contacontabil").getSelectedItem() === null || oView.byId("descricao").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack();
		}
	});

});