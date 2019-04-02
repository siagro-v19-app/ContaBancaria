sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function(Controller, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("br.com.idxtecContaBancaria.controller.ContaBancaria", {
		onInit: function(){
			var oParamModel = new JSONModel();
			
			this.getOwnerComponent().setModel(oParamModel, "parametros");
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},

		onRefresh: function(e){
			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);
			this.getView().byId("tableConta").clearSelection();
		},
		
		onIncluirConta: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oTable = this.byId("tableConta"); 
			
			var oParModel = this.getOwnerComponent().getModel("parametros");
			oParModel.setData({operacao: "incluir"});
			
			oRouter.navTo("gravarconta");
			oTable.clearSelection();
		},
		
		onEditarConta: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oTable = this.byId("tableConta");
			var nIndex = oTable.getSelectedIndex();
			
			if (nIndex === -1){
				MessageBox.warning("Selecione uma conta na tabela.");
				return;
			}
			
			var sPath = oTable.getContextByIndex(nIndex).sPath;
			var oParModel = this.getOwnerComponent().getModel("parametros");
			oParModel.setData({sPath: sPath, operacao: "editar"});
			
			oRouter.navTo("gravarconta");
			oTable.clearSelection();
		},
		
		onRemoverConta: function(e){
			var that = this;
			var oTable = this.byId("tableConta");
			var nIndex = oTable.getSelectedIndex();
			
			if (nIndex === -1){
				MessageBox.warning("Selecione uma conta na tabela.");
				return;
			}
			
			MessageBox.confirm("Deseja remover esta conta?", {
				onClose: function(sResposta){
					if(sResposta === "OK"){
						that._remover(oTable, nIndex);
						MessageBox.success("Conta removida com sucesso!");
					}
				}
			});
		},
		
		_remover: function(oTable, nIndex){
			var oModel = this.getOwnerComponent().getModel();
			var oContext = oTable.getContextByIndex(nIndex);
			
			oModel.remove(oContext.sPath, {
				success: function(){
					oModel.refresh(true);
					oTable.clearSelection();
				},
				error: function(oError){
					MessageBox.error(oError.responseText);
				}
			});
		}
	});
});